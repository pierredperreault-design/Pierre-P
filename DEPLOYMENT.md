# Pierre-P - Guide de Déploiement en Production

Guide complet pour déployer le système de gestion des présences paroissiales en production sur différentes plateformes.

## 📋 Table des matières

- [Architecture de déploiement](#architecture-de-déploiement)
- [Prérequis](#prérequis)
- [Déploiement de la base de données](#déploiement-de-la-base-de-données)
- [Déploiement du serveur backend](#déploiement-du-serveur-backend)
- [Déploiement de l'application mobile](#déploiement-de-lapplication-mobile)
- [Sécurité et HTTPS](#sécurité-et-https)
- [Monitoring et maintenance](#monitoring-et-maintenance)
- [Sauvegarde et récupération](#sauvegarde-et-récupération)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture de déploiement

### Architecture recommandée

```
┌─────────────────────────────────────────────────────────────┐
│                     Utilisateurs Mobiles                     │
│                   (App iOS/Android/Web)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CDN / Load Balancer                       │
│                   (Cloudflare / AWS ELB)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Serveur 1   │  │  Serveur 2   │  │  Serveur 3   │
│   Node.js    │  │   Node.js    │  │   Node.js    │
│   Express    │  │   Express    │  │   Express    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │ SSL/Connexion Pool
                         ↓
                  ┌─────────────────┐
                  │   MySQL/Maria   │
                  │     Database    │
                  │    (Master)     │
                  └─────────────────┘
                         │
                         ↓ Replication
                  ┌─────────────────┐
                  │   MySQL/Maria   │
                  │  (Slave/Backup) │
                  └─────────────────┘
```

## ✅ Prérequis

### Infrastructure serveur

- **Système d'exploitation:** Linux (Ubuntu 20.04+ ou CentOS 8+)
- **Processeur:** Minimum 2 cores (4+ recommandé)
- **Mémoire RAM:** Minimum 4GB (8GB+ recommandé)
- **Disque dur:** Minimum 50GB SSD
- **Connexion:** Bande passante stable, IP fixe
- **SSL/TLS:** Certificat valide (Let's Encrypt gratuit)

### Logiciels nécessaires

- Node.js v16+ LTS
- MySQL 5.7+ ou MariaDB 10.3+
- Nginx ou Apache (reverse proxy)
- Docker (optionnel mais recommandé)
- PM2 ou systemd pour gestion des services

## 🗄️ Déploiement de la base de données

### Option 1: Hébergement managé (Recommandé pour la production)

#### AWS RDS

```bash
# 1. Créer une instance RDS
aws rds create-db-instance \
  --db-instance-identifier eglise-presence-prod \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username admin \
  --master-user-password 'YourSecurePassword123!' \
  --allocated-storage 100 \
  --storage-type gp2 \
  --backup-retention-period 30 \
  --multi-az \
  --publicly-accessible false

# 2. Attendre la création (~15 minutes)
aws rds describe-db-instances --db-instance-identifier eglise-presence-prod

# 3. Obtenir l'endpoint
aws rds describe-db-instances \
  --db-instance-identifier eglise-presence-prod \
  --query 'DBInstances[0].Endpoint.Address'
```

#### DigitalOcean Managed Database

```bash
# Via DigitalOcean CLI
doctl databases create \
  --engine mysql \
  --num-nodes 1 \
  --region nyc3 \
  --size db-s-2vcpu-4gb \
  eglise-presence-prod

# Récupérer la connexion
doctl databases connection get eglise-presence-prod
```

### Option 2: Installation auto-hébergée

#### Sur Ubuntu/Debian

```bash
# 1. Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# 2. Installer MySQL
sudo apt install -y mysql-server mysql-client

# 3. Sécuriser l'installation
sudo mysql_secure_installation

# 4. Créer la base de données
sudo mysql -u root -p << EOF
CREATE DATABASE eglise_presence 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

CREATE USER 'eglise_user'@'localhost' 
IDENTIFIED BY 'SecurePassword123!';

GRANT ALL PRIVILEGES ON eglise_presence.* 
TO 'eglise_user'@'localhost';

FLUSH PRIVILEGES;
EOF

# 5. Importer le schéma
mysql -u eglise_user -p eglise_presence < database/schema.sql

# 6. Importer les données d'exemple
mysql -u eglise_user -p eglise_presence < database/sample_data.sql
```

#### Configuration MySQL pour production

Modifier `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# Performance
max_connections = 1000
max_allowed_packet = 256M
thread_stack = 256K
thread_cache_size = 128
myisam_recover_options = BACKUP

# InnoDB
default-storage-engine = InnoDB
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_file_per_table = 1

# Logging
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2

# Replication (si applicable)
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
```

Redémarrer MySQL:

```bash
sudo systemctl restart mysql
```

## 🚀 Déploiement du serveur backend

### Option 1: Déploiement avec Docker (Recommandé)

#### Créer le Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Créer docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_USER: eglise_user
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: eglise_presence
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql
    volumes:
      - ./logs:/app/logs

  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: eglise_presence
      MYSQL_USER: eglise_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

#### Fichier .env pour production

```bash
NODE_ENV=production
PORT=3000
DB_HOST=mysql
DB_USER=eglise_user
DB_PASSWORD=YourSecurePassword123!
DB_NAME=eglise_presence
JWT_SECRET=YourVeryLongSecretKeyFor JWT!
JWT_EXPIRE=7d
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

#### Déployer avec Docker

```bash
# 1. Build l'image
docker-compose build

# 2. Lancer les services
docker-compose up -d

# 3. Vérifier le statut
docker-compose ps

# 4. Voir les logs
docker-compose logs -f backend

# 5. Arrêter
docker-compose down
```

### Option 2: Déploiement direct sur serveur Linux

#### Créer le backend Node.js/Express

Fichier `server.js`:

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Connection pool MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, email FROM members WHERE email = ? AND password = SHA2(?, 256)',
      [email, password]
    );
    
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: users[0].id, email: users[0].email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({ token, user: users[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get events today
app.get('/api/events/today', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [events] = await connection.query(
      'SELECT * FROM events WHERE eventDate = CURDATE()'
    );
    connection.release();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Check-in attendance
app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
  try {
    const { eventId, memberId, checkinTime } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO attendance (memberId, eventId, attendanceStatus, checkinTime, recordedBy) VALUES (?, ?, ?, ?, ?)',
      [memberId, eventId, 'present', checkinTime, req.user.id]
    );

    connection.release();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
  }
});

// Get attendance history
app.get('/api/attendance/history', authenticateToken, async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const connection = await pool.getConnection();
    
    const [records] = await connection.query(`
      SELECT a.*, m.firstName, m.lastName, e.eventName, e.eventDate
      FROM attendance a
      JOIN members m ON a.memberId = m.id
      JOIN events e ON a.eventId = e.id
      ORDER BY a.createdAt DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    connection.release();
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get members
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const status = req.query.status || 'active';
    const connection = await pool.getConnection();
    
    const [members] = await connection.query(
      'SELECT id, firstName, lastName, email, phone FROM members WHERE status = ?',
      [status]
    );
    
    connection.release();
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
```

Package.json:

```json
{
  "name": "pierre-p-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.3.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0"
  }
}
```

#### Installer et lancer sur le serveur

```bash
# 1. SSH sur le serveur
ssh user@your-server-ip

# 2. Cloner le repository
git clone https://github.com/pierredperreault-design/Pierre-P.git
cd Pierre-P

# 3. Installer les dépendances
npm install

# 4. Créer le fichier .env
cp .env.example .env
nano .env  # Éditer les valeurs

# 5. Installer PM2 globalement
npm install -g pm2

# 6. Lancer l'application
pm2 start server.js --name "pierre-p-backend"

# 7. Configurer PM2 pour démarrage automatique
pm2 startup
pm2 save

# 8. Vérifier le statut
pm2 status
pm2 logs pierre-p-backend
```

### Configurer Nginx comme reverse proxy

Fichier `/etc/nginx/sites-available/pierre-p`:

```nginx
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirection HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Proxy
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Activer la configuration:

```bash
sudo ln -s /etc/nginx/sites-available/pierre-p /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📱 Déploiement de l'application mobile

### iOS - App Store

```bash
# 1. Se connecter à Expo
eas login

# 2. Générer la build iOS
eas build --platform ios

# 3. Télécharger sur App Store
# Utiliser Transporter ou Xcode
eas submit --platform ios

# 4. Accepter les termes et soumettre
```

### Android - Google Play

```bash
# 1. Se connecter à Expo
eas login

# 2. Générer la build Android
eas build --platform android

# 3. Télécharger sur Google Play
eas submit --platform android

# 4. Suivre le processus de soumission
```

### Web - Netlify/Vercel

```bash
# 1. Build pour le web
cd mobile
npm run build

# 2. Déployer sur Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Ou sur Vercel
vercel --prod
```

## 🔒 Sécurité et HTTPS

### Obtenir un certificat SSL avec Let's Encrypt

```bash
# 1. Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtenir le certificat
sudo certbot certonly --nginx -d api.yourdomain.com

# 3. Configuration automatique renouvellement
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 4. Tester la configuration
sudo certbot renew --dry-run
```

### Configuration de sécurité

```bash
# 1. Firewall (UFW)
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3306/tcp  # MySQL (IP interne seulement)

# 2. Restreindre l'accès à MySQL
sudo ufw allow from 127.0.0.1 to any port 3306

# 3. SSH hardening
# Éditer /etc/ssh/sshd_config
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no

sudo systemctl restart ssh
```

## 📊 Monitoring et maintenance

### Configurer les logs

Fichier `ecosystem.config.js` pour PM2:

```javascript
module.exports = {
  apps: [{
    name: 'pierre-p-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

### Monitoring avec PM2+

```bash
# 1. Installer PM2+
pm2 install pm2-logrotate

# 2. Lancer le monitoring
pm2 monitor

# 3. Alertes email
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:max_size 100M
```

### Monitoring des ressources

```bash
# Installer Prometheus node exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.5.0.linux-amd64.tar.gz
sudo mv node_exporter-1.5.0.linux-amd64/node_exporter /usr/local/bin/

# Créer un service systemd
sudo tee /etc/systemd/system/node-exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=nobody
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable node-exporter
sudo systemctl start node-exporter
```

## 💾 Sauvegarde et récupération

### Sauvegardes automatiques

Script de sauvegarde (`backup.sh`):

```bash
#!/bin/bash

BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="eglise_user"
DB_PASSWORD="your_password"
DB_NAME="eglise_presence"

# Créer le répertoire si nécessaire
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Supprimer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Envoyer vers stockage distant (S3)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-bucket/backups/

echo "Sauvegarde complétée: backup_$DATE.sql.gz"
```

Planifier avec cron:

```bash
# Éditer crontab
crontab -e

# Ajouter: Sauvegarder tous les jours à 2h du matin
0 2 * * * /usr/local/bin/backup.sh
```

### Restaurer une sauvegarde

```bash
# 1. Télécharger la sauvegarde
aws s3 cp s3://your-bucket/backups/backup_20260707_020000.sql.gz .

# 2. Décompresser
gunzip backup_20260707_020000.sql.gz

# 3. Restaurer
mysql -u eglise_user -p eglise_presence < backup_20260707_020000.sql

# 4. Vérifier
mysql -u eglise_user -p eglise_presence -e "SELECT COUNT(*) FROM members;"
```

## 🔧 Troubleshooting

### La base de données ne répond pas

```bash
# 1. Vérifier le statut MySQL
sudo systemctl status mysql

# 2. Redémarrer MySQL
sudo systemctl restart mysql

# 3. Vérifier les logs
sudo tail -f /var/log/mysql/error.log

# 4. Vérifier la connexion
mysql -u root -p -e "SELECT 1;"
```

### Le backend ne démarre pas

```bash
# 1. Vérifier les erreurs PM2
pm2 logs pierre-p-backend

# 2. Tester la connexion DB
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'localhost',
  user: 'eglise_user',
  password: 'password',
  database: 'eglise_presence'
}).then(conn => {
  console.log('Connection OK');
  conn.end();
}).catch(err => console.error('Connection failed:', err));
"

# 3. Vérifier les ports
netstat -tlnp | grep 3000
```

### Problèmes SSL/HTTPS

```bash
# 1. Tester le certificat
ssl-test-check api.yourdomain.com

# 2. Renouveler le certificat
sudo certbot renew --force-renewal

# 3. Vérifier Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Logs pleins

```bash
# 1. Vérifier l'espace disque
df -h

# 2. Nettoyer les anciens logs
sudo journalctl --vacuum=time=7d

# 3. Configurer la rotation des logs
# Éditer /etc/logrotate.d/pierre-p
/var/log/pierre-p/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
}
```

## 📈 Étapes de déploiement résumées

### Checklist de déploiement

```
Base de données:
  ☐ Créer la base de données
  ☐ Importer le schéma
  ☐ Configurer les sauvegardes
  ☐ Tester la connexion

Backend:
  ☐ Installer Node.js et npm
  ☐ Cloner le repository
  ☐ Installer les dépendances
  ☐ Configurer les variables d'environnement
  ☐ Lancer avec PM2
  ☐ Configurer Nginx
  ☐ Configurer SSL/HTTPS

Mobile:
  ☐ Mettre à jour l'API endpoint
  ☐ Générer les builds pour iOS
  ☐ Générer les builds pour Android
  ☐ Soumettre aux app stores
  ☐ Tester sur appareils réels

Sécurité:
  ☐ Configurer le firewall
  ☐ Activer HTTPS
  ☐ Sécuriser SSH
  ☐ Tester les pénétrations
  ☐ Configurer les sauvegardes hors-site

Monitoring:
  ☐ Configurer les logs
  ☐ Mettre en place le monitoring
  ☐ Configurer les alertes
  ☐ Tester la récupération
```

## 🔗 Ressources utiles

- **Docker Hub:** https://hub.docker.com
- **Let's Encrypt:** https://letsencrypt.org
- **Expo:** https://docs.expo.dev/deployment
- **PM2:** https://pm2.keymetrics.io
- **Nginx:** https://nginx.org/en/docs

---

**Version:** 1.0.0  
**Dernière mise à jour:** Juillet 2026  
**Auteur:** pierredperreault-design

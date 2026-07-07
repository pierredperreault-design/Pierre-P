# Pierre-P - Système de Gestion des Présences Paroissiales

Un système complet de gestion des présences pour les églises, permettant de suivre l'assistance aux services religieux, réunions et événements paroissiales.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture de la base de données](#architecture-de-la-base-de-données)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Requêtes SQL utiles](#requêtes-sql-utiles)
- [Support et contribution](#support-et-contribution)

## 🎯 Vue d'ensemble

Pierre-P est une application de gestion des présences conçue pour les églises. Elle offre:

✅ **Gestion des membres** - Profils complets avec historique  
✅ **Suivi des présences** - Enregistrement des entrées/sorties  
✅ **Événements paroissiaux** - Services, réunions, événements spéciaux  
✅ **Gestion des rôles** - Responsabilités et fonctions paroissiales  
✅ **Statistiques** - Rapports d'assistance et participation  
✅ **Base de données relationnelle** - Intégrité et sécurité des données  
✅ **Application mobile** - Enregistrement des présences en temps réel  

## 🏗️ Architecture de la base de données

### Tables principales

```
members (Membres)
├── id, firstName, lastName, email, phone
├── address, city, postalCode
├── joinDate, status, notes
└── familyId (référence aux families)

events (Événements)
├── id, eventName, eventType
├── eventDate, startTime, endTime
├── location, description, capacity
└── notes

attendance (Présences)
├── id, memberId, eventId
├── attendanceStatus (present, absent, late, excused, virtual)
├── checkinTime, checkoutTime
└── notes, recordedBy

roles (Rôles)
├── id, roleName
└── description

member_roles (Affectations de rôles)
├── memberId, roleId
├── assignedDate
└── notes

families (Familles)
├── id, familyName
├── headOfHousehold, address, phone
└── notes
```

### Vues disponibles

- **attendance_statistics** - Résumé des présences par événement
- **member_attendance_history** - Historique complet des présences par membre

## 💻 Installation

### Prérequis

- **MySQL 5.7+** ou **MariaDB 10.3+**
- **MySQL Client** ou **phpMyAdmin** pour gérer la base de données
- Accès administrateur à votre serveur MySQL
- **Node.js v14+** pour l'application mobile
- **npm** ou **yarn**

### Étapes d'installation Base de Données

#### 1. Créer la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Dans le shell MySQL:
CREATE DATABASE eglise_presence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eglise_presence;
```

#### 2. Importer le schéma

```bash
# Depuis la ligne de commande
mysql -u root -p eglise_presence < database/schema.sql

# Ou depuis le shell MySQL:
# mysql> source database/schema.sql;
```

#### 3. Charger les données d'exemple (optionnel)

```bash
# Depuis la ligne de commande
mysql -u root -p eglise_presence < database/sample_data.sql

# Ou depuis le shell MySQL:
# mysql> source database/sample_data.sql;
```

#### 4. Vérifier l'installation

```sql
-- Afficher les tables créées
SHOW TABLES;

-- Vérifier les données d'exemple
SELECT COUNT(*) as total_members FROM members;
SELECT COUNT(*) as total_events FROM events;
SELECT COUNT(*) as total_attendance FROM attendance;
```

### Installation Application Mobile

Voir [mobile/SETUP.md](mobile/SETUP.md) pour les instructions détaillées.

```bash
cd mobile
npm install
npm start
```

## ⚙️ Configuration

### Créer un utilisateur MySQL dédié (recommandé)

```sql
-- Créer un utilisateur avec privilèges limités
CREATE USER 'eglise_user'@'localhost' IDENTIFIED BY 'mot_de_passe_secure';

-- Octroyer les permissions nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON eglise_presence.* TO 'eglise_user'@'localhost';

-- Appliquer les modifications
FLUSH PRIVILEGES;
```

### Paramètres de connexion

Utilisez ces paramètres pour votre application:

```
Hôte: localhost (ou votre serveur)
Base de données: eglise_presence
Utilisateur: eglise_user
Mot de passe: [votre mot de passe]
Port: 3306 (port par défaut MySQL)
```

## 📖 Utilisation

### Ajouter un nouveau membre

```sql
INSERT INTO members (firstName, lastName, email, phone, joinDate, status)
VALUES ('Paul', 'Dubois', 'paul.dubois@email.com', '514-555-0123', CURDATE(), 'active');
```

### Enregistrer une présence

```sql
INSERT INTO attendance (memberId, eventId, attendanceStatus, checkinTime, recordedBy)
VALUES (1, 5, 'present', '10:00:00', 1);
```

### Créer un nouvel événement

```sql
INSERT INTO events (eventName, eventType, eventDate, startTime, endTime, location, capacity)
VALUES ('Messe du Dimanche', 'service', '2026-07-12', '10:00:00', '11:30:00', 'Église Saint-Pierre', 200);
```

### Assigner un rôle à un membre

```sql
INSERT INTO member_roles (memberId, roleId, assignedDate)
VALUES (3, 2, CURDATE());
-- (memberId=3 comme Diacre, roleId=2)
```

## 📊 Requêtes SQL utiles

### Voir l'historique de présences d'un membre

```sql
SELECT 
    e.eventName,
    e.eventDate,
    a.attendanceStatus,
    a.checkinTime,
    a.checkoutTime
FROM attendance a
JOIN events e ON a.eventId = e.id
WHERE a.memberId = 1
ORDER BY e.eventDate DESC;
```

### Obtenir les statistiques de présence d'un événement

```sql
SELECT * FROM attendance_statistics
WHERE eventId = 5;
```

### Lister les membres actifs avec leurs rôles

```sql
SELECT 
    CONCAT(m.firstName, ' ', m.lastName) as nom,
    GROUP_CONCAT(r.roleName SEPARATOR ', ') as roles,
    m.email,
    m.phone
FROM members m
LEFT JOIN member_roles mr ON m.id = mr.memberId
LEFT JOIN roles r ON mr.roleId = r.id
WHERE m.status = 'active'
GROUP BY m.id, m.firstName, m.lastName, m.email, m.phone
ORDER BY m.lastName;
```

### Taux de présence par membre

```sql
SELECT 
    CONCAT(m.firstName, ' ', m.lastName) as nom,
    COUNT(DISTINCT a.eventId) as total_events,
    SUM(CASE WHEN a.attendanceStatus = 'present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN a.attendanceStatus = 'late' THEN 1 ELSE 0 END) as late,
    SUM(CASE WHEN a.attendanceStatus = 'absent' THEN 1 ELSE 0 END) as absent,
    ROUND(
        100 * SUM(CASE WHEN a.attendanceStatus IN ('present', 'late') THEN 1 ELSE 0 END) / 
        COUNT(DISTINCT a.eventId), 1
    ) as taux_presence
FROM members m
LEFT JOIN attendance a ON m.id = a.memberId
WHERE m.status = 'active'
GROUP BY m.id, m.firstName, m.lastName
ORDER BY taux_presence DESC;
```

## 📁 Structure du projet

```
Pierre-P/
├── database/
│   ├── schema.sql           # Schéma de la base de données
│   └── sample_data.sql      # Données d'exemple
├── mobile/
│   ├── App.js               # App React Native principale
│   ├── package.json         # Dépendances mobile
│   ├── app.json             # Configuration Expo
│   ├── SETUP.md             # Guide de setup mobile
│   └── assets/              # Images et icônes
├── README.md                # Ce fichier
└── .gitignore              # Fichiers à ignorer
```

## 🔐 Sécurité

### Recommandations de sécurité

1. **Accès à la base de données**
   - Utilisez toujours un utilisateur MySQL avec privilèges minimaux
   - Ne partagez jamais le mot de passe root
   - Restreignez l'accès à localhost si possible

2. **Sauvegardes**
   ```bash
   # Sauvegarder la base de données
   mysqldump -u root -p eglise_presence > backup_$(date +%Y%m%d).sql
   ```

3. **Mises à jour de données sensibles**
   - Validez toutes les entrées
   - Utilisez des transactions pour les opérations critiques
   - Conservez un journal d'audit

4. **API Communication**
   - Utilisez toujours HTTPS en production
   - Implémentez l'authentification JWT
   - Validez toutes les requêtes côté serveur

## 📱 Application Mobile

L'application mobile est construite avec React Native et Expo.

### Fonctionnalités principales:
- ✅ Authentification sécurisée
- ✅ Enregistrement des présences en temps réel
- ✅ Historique des présences
- ✅ Répertoire des membres
- ✅ Paramètres utilisateur
- ✅ Interface intuitive et responsif

### Plateformes supportées:
- ✅ iOS (10+)
- ✅ Android (5+)
- ✅ Web (navigateurs modernes)

Voir [mobile/SETUP.md](mobile/SETUP.md) pour plus de détails.

## 📈 Prochaines étapes

Considérez ces améliorations:

- [ ] **API REST** - Node.js/Express pour accès programmatique
- [ ] **Interface web** - Dashboard React/Vue pour visualisation
- [ ] **Rapports PDF** - Génération de rapports de présence
- [ ] **Notifications email** - Alertes pour absences
- [ ] **Scan QR/Barcode** - Accélération de l'enregistrement
- [ ] **Authentification** - Système de login sécurisé
- [ ] **Logs d'audit** - Traçabilité de toutes les modifications

## 🆘 Troubleshooting

### Erreur Base de Données: "Access denied for user"
- Vérifiez le nom d'utilisateur et le mot de passe
- Assurez-vous que l'utilisateur a les permissions sur la base de données

### Erreur: "Table doesn't exist"
- Vérifiez que vous avez importé le schéma (`schema.sql`)
- Assurez-vous d'utiliser la bonne base de données (`USE eglise_presence;`)

### Application mobile ne démarre pas
- Voir section Troubleshooting dans [mobile/SETUP.md](mobile/SETUP.md)

## 📞 Support et contribution

### Signaler un problème

Créez une [issue GitHub](https://github.com/pierredperreault-design/Pierre-P/issues) avec:
- Description du problème
- Étapes pour reproduire
- Résultats attendus vs réels

### Contribuer

Les contributions sont bienvenues! Veuillez:
1. Forker le repository
2. Créer une branche pour votre feature
3. Soumettre une pull request

## 📜 Licence

Ce projet est fourni tel quel pour usage paroissial.

## 👨‍💼 Auteur

Créé par: **pierredperreault-design**  
Date: Juillet 2026

---

**Besoin d'aide?**
- Documentation MySQL: https://dev.mysql.com/doc/
- React Native: https://reactnative.dev
- Expo: https://docs.expo.dev

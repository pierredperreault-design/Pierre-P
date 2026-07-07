-- Church Attendance Management System
-- Sample Data for Testing

-- Insert Sample Members
INSERT INTO members (firstName, lastName, email, phone, address, city, postalCode, joinDate, status, notes) VALUES
('Jean', 'Dupont', 'jean.dupont@email.com', '514-123-4567', '123 Rue de l\'Église', 'Montréal', 'H1A 1A1', '2020-01-15', 'active', 'Membre fondateur'),
('Marie', 'Tremblay', 'marie.tremblay@email.com', '514-234-5678', '456 Avenue des Fleurs', 'Montréal', 'H2B 2B2', '2019-06-20', 'active', 'Chantre'),
('Pierre', 'Gagnon', 'pierre.gagnon@email.com', '514-345-6789', '789 Boulevard Saint-Joseph', 'Montréal', 'H3C 3C3', '2021-03-10', 'active', 'Diacre'),
('Anne', 'Rousseau', 'anne.rousseau@email.com', '514-456-7890', '321 Chemin du Parc', 'Montréal', 'H4D 4D4', '2020-11-05', 'active', 'Coordinatrice bénévoles'),
('Michel', 'Lemaire', 'michel.lemaire@email.com', '514-567-8901', '654 Rue de la Paix', 'Montréal', 'H5E 5E5', '2022-01-12', 'active', 'Responsable finances'),
('Sophie', 'Bernard', 'sophie.bernard@email.com', '514-678-9012', '987 Avenue Principale', 'Montréal', 'H6F 6F6', '2021-09-18', 'active', NULL),
('Luc', 'Gauthier', 'luc.gauthier@email.com', '514-789-0123', '147 Rue Sainte-Catherine', 'Montréal', 'H7G 7G7', '2020-05-22', 'active', 'Organiste'),
('Josée', 'Leclerc', 'josee.leclerc@email.com', '514-890-1234', '258 Boulevard des Érables', 'Montréal', 'H8H 8H8', '2021-07-30', 'inactive', 'Déménagée'),
('Robert', 'Mailloux', 'robert.mailloux@email.com', '514-901-2345', '369 Route de la Montagne', 'Montréal', 'H9I 9I9', '2019-02-14', 'active', NULL),
('Carole', 'Deschamps', 'carole.deschamps@email.com', '514-012-3456', '456 Allée des Pins', 'Montréal', 'H1J 1J1', '2020-08-09', 'active', 'Animatrice catéchèse'),
('Francine', 'Préfontaine', 'francine.prefontaine@email.com', '514-111-2222', '789 Rue de la Ruelle', 'Montréal', 'H2K 2K2', '2018-04-25', 'active', NULL),
('Daniel', 'Bédard', 'daniel.bedard@email.com', '514-222-3333', '321 Avenue de l\'Église', 'Montréal', 'H3L 3L3', '2021-11-08', 'active', 'Lecteur');

-- Insert Sample Families
INSERT INTO families (familyName, headOfHousehold, address, phone, notes) VALUES
(1, 'Dupont', '123 Rue de l\'Église', '514-123-4567', 'Famille fondatrice'),
(2, 'Tremblay', '456 Avenue des Fleurs', '514-234-5678', NULL),
(3, 'Gagnon', '789 Boulevard Saint-Joseph', '514-345-6789', 'Famille active'),
(4, 'Rousseau', '321 Chemin du Parc', '514-456-7890', NULL),
(5, 'Lemaire', '654 Rue de la Paix', '514-567-8901', NULL);

-- Update members with family assignments
UPDATE members SET familyId = 1 WHERE id IN (1);
UPDATE members SET familyId = 2 WHERE id IN (2);
UPDATE members SET familyId = 3 WHERE id IN (3);
UPDATE members SET familyId = 4 WHERE id IN (4);
UPDATE members SET familyId = 5 WHERE id IN (5);

-- Insert Sample Roles
INSERT INTO roles (roleName, description) VALUES
('Pasteur', 'Responsable principal de l\'église'),
('Diacre', 'Assistant du pasteur'),
('Chantre', 'Responsable du chant et de la musique'),
('Lecteur', 'Lit les lectures pendant les services'),
('Bénévole', 'Aide générale'),
('Trésorier', 'Gère les finances'),
('Animateur Catéchèse', 'Enseigne le catéchisme'),
('Coordinateur Bénévoles', 'Organise les bénévoles');

-- Insert Sample Member Roles
INSERT INTO member_roles (memberId, roleId, assignedDate, notes) VALUES
(1, 2, '2020-01-15', 'Diacre depuis la fondation'),
(2, 3, '2019-06-20', 'Chantre principal'),
(3, 2, '2021-03-10', NULL),
(4, 8, '2020-11-05', 'Coordinatrice depuis 2020'),
(5, 6, '2022-01-12', 'Trésorier'),
(7, 3, '2020-05-22', 'Organiste et chantre'),
(10, 7, '2020-08-09', NULL),
(12, 4, '2021-11-08', 'Lecteur principal'),
(6, 5, '2021-09-18', NULL),
(9, 5, '2019-02-14', NULL),
(11, 5, '2018-04-25', 'Bénévole expérience');

-- Insert Sample Events (Services and Meetings)
INSERT INTO events (eventName, eventType, eventDate, startTime, endTime, location, description, capacity, notes) VALUES
('Messe du Dimanche', 'service', '2026-07-05', '10:00:00', '11:30:00', 'Église Saint-Pierre', 'Service religieux hebdomadaire', 200, 'Service principal'),
('Messe du Dimanche', 'service', '2026-06-28', '10:00:00', '11:30:00', 'Église Saint-Pierre', 'Service religieux hebdomadaire', 200, NULL),
('Messe du Dimanche', 'service', '2026-06-21', '10:00:00', '11:30:00', 'Église Saint-Pierre', 'Service religieux hebdomadaire', 200, NULL),
('Messe du Dimanche', 'service', '2026-06-14', '10:00:00', '11:30:00', 'Église Saint-Pierre', 'Service religieux hebdomadaire', 200, NULL),
('Messe du Dimanche', 'service', '2026-07-12', '10:00:00', '11:30:00', 'Église Saint-Pierre', 'Service religieux hebdomadaire', 200, NULL),
('Réunion du Conseil Paroissial', 'meeting', '2026-07-01', '19:00:00', '20:30:00', 'Salle paroissiale', 'Réunion mensuelle du conseil', 30, 'Réunion administrative'),
('Catéchèse Enfants', 'class', '2026-06-26', '14:00:00', '15:30:00', 'Salle de classe', 'Formation religieuse des enfants', 25, 'Samedi après-midi'),
('Groupe de Prière', 'prayer_group', '2026-06-25', '19:30:00', '20:30:00', 'Chapelle', 'Prière communautaire', 50, 'Chaque jeudi'),
('Messe de Noël', 'special_event', '2025-12-25', '00:00:00', '02:00:00', 'Église Saint-Pierre', 'Messe de minuit - Noël', 300, 'Célébration spéciale'),
('Pèlerinage Annuel', 'special_event', '2026-08-15', '08:00:00', '17:00:00', 'Sanctuaire voisin', 'Pèlerinage à Sainte-Anne', 150, 'Événement annuel');

-- Insert Sample Attendance Records
INSERT INTO attendance (memberId, eventId, attendanceStatus, checkinTime, checkoutTime, notes, recordedBy) VALUES
-- Messe du 5 juillet 2026 (eventId 1)
(1, 1, 'present', '09:55:00', '11:35:00', NULL, 1),
(2, 1, 'present', '09:50:00', '11:30:00', 'Chanté très bien', 1),
(3, 1, 'present', '10:05:00', '11:35:00', NULL, 1),
(4, 1, 'present', '09:48:00', '11:32:00', NULL, 1),
(5, 1, 'late', '10:15:00', '11:30:00', 'Arrivé tard', 1),
(6, 1, 'present', '10:00:00', '11:30:00', NULL, 1),
(7, 1, 'present', '09:45:00', '11:35:00', 'Orgue exceptionnelle', 1),
(9, 1, 'absent', NULL, NULL, 'Malade', 1),
(10, 1, 'present', '10:02:00', '11:30:00', NULL, 1),
(11, 1, 'present', '09:55:00', '11:28:00', NULL, 1),
(12, 1, 'present', '09:50:00', '11:33:00', 'Très bonne lecture', 1),

-- Messe du 28 juin 2026 (eventId 2)
(1, 2, 'present', '10:00:00', '11:30:00', NULL, 1),
(2, 2, 'present', '09:55:00', '11:30:00', NULL, 1),
(3, 2, 'present', '10:05:00', '11:30:00', NULL, 1),
(4, 2, 'present', '09:50:00', '11:30:00', NULL, 1),
(5, 2, 'present', '10:00:00', '11:30:00', NULL, 1),
(6, 2, 'absent', NULL, NULL, 'Congé', 1),
(7, 2, 'present', '09:50:00', '11:30:00', NULL, 1),
(9, 2, 'present', '10:10:00', '11:30:00', NULL, 1),
(10, 2, 'late', '10:20:00', '11:30:00', NULL, 1),
(11, 2, 'present', '10:00:00', '11:30:00', NULL, 1),
(12, 2, 'present', '09:55:00', '11:30:00', NULL, 1),

-- Messe du 21 juin 2026 (eventId 3)
(1, 3, 'present', '09:55:00', '11:30:00', NULL, 1),
(2, 3, 'present', '10:00:00', '11:30:00', NULL, 1),
(3, 3, 'present', '10:05:00', '11:30:00', NULL, 1),
(4, 3, 'present', '09:50:00', '11:30:00', NULL, 1),
(5, 3, 'absent', NULL, NULL, 'Réunion importante', 1),
(6, 3, 'present', '10:00:00', '11:30:00', NULL, 1),
(7, 3, 'present', '09:45:00', '11:30:00', NULL, 1),
(9, 3, 'present', '10:05:00', '11:30:00', NULL, 1),
(10, 3, 'present', '10:00:00', '11:30:00', NULL, 1),
(11, 3, 'present', '09:55:00', '11:30:00', NULL, 1),
(12, 3, 'present', '10:00:00', '11:30:00', NULL, 1),

-- Messe du 14 juin 2026 (eventId 4)
(1, 4, 'present', '10:00:00', '11:30:00', NULL, 1),
(2, 4, 'present', '09:55:00', '11:30:00', NULL, 1),
(3, 4, 'present', '10:05:00', '11:30:00', NULL, 1),
(4, 4, 'present', '09:50:00', '11:30:00', NULL, 1),
(5, 4, 'present', '10:00:00', '11:30:00', NULL, 1),
(6, 4, 'absent', NULL, NULL, 'Visite famille', 1),
(7, 4, 'present', '09:50:00', '11:30:00', NULL, 1),
(9, 4, 'present', '10:10:00', '11:30:00', NULL, 1),
(10, 4, 'late', '10:25:00', '11:30:00', 'Circulation', 1),
(11, 4, 'present', '10:00:00', '11:30:00', NULL, 1),
(12, 4, 'present', '09:55:00', '11:30:00', NULL, 1),

-- Catéchèse Enfants (eventId 7)
(10, 7, 'present', '14:00:00', '15:30:00', NULL, 4),
(6, 7, 'present', '14:05:00', '15:30:00', NULL, 4),

-- Groupe de Prière (eventId 8)
(1, 8, 'present', '19:30:00', '20:30:00', NULL, 4),
(2, 8, 'present', '19:35:00', '20:30:00', NULL, 4),
(4, 8, 'present', '19:30:00', '20:30:00', NULL, 4),
(11, 8, 'present', '19:40:00', '20:30:00', NULL, 4),
(12, 8, 'absent', NULL, NULL, 'Engagement ailleurs', 4),

-- Réunion du Conseil (eventId 6)
(1, 6, 'present', '19:00:00', '20:30:00', NULL, 1),
(3, 6, 'present', '19:00:00', '20:30:00', NULL, 1),
(4, 6, 'present', '19:05:00', '20:30:00', NULL, 1),
(5, 6, 'present', '19:00:00', '20:35:00', NULL, 1),
(7, 6, 'late', '19:15:00', '20:30:00', 'Retard', 1);

-- Display confirmation message
SELECT 'Sample data successfully inserted!' as message;

-- Show summary statistics
SELECT 
    'Membres insérés: ' as info, COUNT(*) as count
FROM members
UNION ALL
SELECT 'Rôles insérés: ' as info, COUNT(*) as count
FROM roles
UNION ALL
SELECT 'Événements insérés: ' as info, COUNT(*) as count
FROM events
UNION ALL
SELECT 'Présences enregistrées: ' as info, COUNT(*) as count
FROM attendance;
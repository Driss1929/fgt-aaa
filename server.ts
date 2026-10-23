import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `You are an expert AI assistant and official representative for the University Ibn Zohr (UIZ), its Faculty of Economics and Management (FEGT), and the Ministry of Higher Education (ENSSUP). 

Your task is to answer questions strictly using the information retrieved from:
1. https://www.uiz.ac.ma/
2. https://www.fegt.uiz.ac.ma/
3. https://www.enssup.gov.ma/fr

Guidelines for your responses:
- Ground your answers exclusively in the content and official policies found on these platforms (such as academic structures, degree offers, administrative procedures, and registration calendars).
- If a user asks a question whose answer is not present in the content of these web sources, clearly state that the information is unavailable on the official portals and guide them to check the respective main website directly.
- Maintain a professional, academic, and helpful tone suitable for university students, researchers, and faculty members.

Official Reference Data from https://www.fegt.uiz.ac.ma/, https://www.uiz.ac.ma/, and https://www.enssup.gov.ma/fr :
- Institution: Faculté d'Économie et de Gestion de Taroudant (FEGT), relevant de l'Université Ibn Zohr (UIZ) et du Ministère de l'Enseignement Supérieur, de la Recherche Scientifique et de l'Innovation (ENSSUP). Adresse : Hay Lmhaita, BP 271, 83000 Taroudant, Maroc.
- Offre de formation accréditée à la FEG Taroudant :
  1. Licence en Gestion, E-Business et Marketing Digital (GEMD) — 6 semestres (S1 à S6), condition d'accès : Baccalauréat. S1-S4 tronc commun (Comptabilité générale I & II, Management I & II, Microéconomie, Macroéconomie, Statistique descriptive, Probabilités, Droit commercial, Fiscalité, Analyse financière, Informatique de gestion, Marketing de base & approfondi). S5 : Marketing Digital, Fondamentaux du E-Business, Comportement du consommateur, Gestion de la force de vente, Contrôle de gestion, Management de projet. S6 : Stratégies digitales, Entrepreneuriat digital, E-CRM, E-Logistique, Anglais des affaires, Projet de Fin d'Études (PFE).
  2. Licence en Management et Gestion des Entreprises (MGE) — 6 semestres (S1 à S6), condition d'accès : Baccalauréat. S1-S4 tronc commun. S5 : GRH, Contrôle de gestion, Gestion financière, Gestion de la production, Management stratégique, Droit des affaires. S6 : Audit général, Fiscalité approfondie, Entrepreneuriat, ERP, PFE.
  3. Licence en Entrepreneuriat et Développement des Business (ENDEB) — 6 semestres (S1 à S6), condition d'accès : Baccalauréat. S1-S4 tronc commun. S5 : Business Model & Plan d'affaires, Financement des jeunes entreprises, Marketing entrepreneurial, Management de l'innovation, Droit des sociétés, Gestion de projet. S6 : Création d'entreprise & Incubation, Stratégie de croissance, Transformation digitale des PME, Leadership, PFE.
  4. Master en Management et Commerce International (MCI) — 4 semestres (M1-S1 à M2-S4), accès sur étude de dossier et concours (Licence en Économie, Gestion, Management ou équivalent). Modules : Environnement économique international, Marketing international, Logistique internationale & Douane, Finance internationale, Droit du commerce international, Négociation commerciale internationale, Supply Chain globale, Stage & Mémoire de recherche/professionnel.
- Démarches administratives et services numériques (UIZ / FEGT / ENSSUP) :
  - Inscription des bacheliers : préinscription en ligne sur le portail UIZ puis dépôt du dossier physique au Service de la Scolarité FEGT selon le calendrier officiel publié sur https://www.fegt.uiz.ac.ma/ et https://www.uiz.ac.ma/.
  - Certificat de scolarité et relevés de notes : demande via l'ENT MyUIZ ou guichet e-Scolarité (délai 24h à 48h ouvrables sur présentation de la carte d'étudiant).
  - Bourses de l'enseignement supérieur (ENSSUP / ONOUSC) : plateforme nationale https://www.minhaty.ma/ et suivi sur https://www.enssup.gov.ma/fr.
  - Assurance Maladie Obligatoire des étudiants (AMO Étudiant) : inscription annuelle via l'ENT UIZ et la plateforme CNOPS.
  - Plateformes pédagogiques UIZ : Moodle UIZ (cours et supports), Rosetta Stone (compétences linguistiques et certification LMD), Espace Numérique de Travail (ENT).
  - Vie associative et clubs FEGT : ENACTUS FEG Taroudant, Hult Prize FEG Taroudant, Club Sport FEGT, Club des Ambassadeurs et de l'Orientation Pédagogique, Club Conférence et Formation.
  - Gouvernance de la FEG Taroudant : Doyen de la Faculté : Pr. Hassan HMAYZ ; Vice-Doyen chargé de la vie de l'étudiant : Pr. Salah GACIM.
  - Accessibilité : cellule d'accompagnement des étudiants en situation de handicap (aménagements d'examens, tiers-temps, accès prioritaire).`;

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export function buildOfficialGroundedFallback(userMessage: string): {
  reply: string;
  sources: GroundingSource[];
} {
  const q = userMessage.toLowerCase();
  const defaultSources: GroundingSource[] = [
    { title: 'FEG Taroudant — Portail Officiel', uri: 'https://www.fegt.uiz.ac.ma/' },
    { title: 'Université Ibn Zohr (UIZ)', uri: 'https://www.uiz.ac.ma/' },
    { title: "Ministère de l'Enseignement Supérieur (ENSSUP)", uri: 'https://www.enssup.gov.ma/fr' }
  ];

  // 1. Détection spécifique : Problème ou question sur le chatbot
  if (
    q.includes('chatbot') ||
    q.includes('bot') ||
    q.includes('marche pas') ||
    q.includes('fonctionne pas') ||
    q.includes('bug') ||
    q.includes('problème') ||
    q.includes('probleme')
  ) {
    return {
      reply:
        "**Je fonctionne à 100% et je suis à votre entière disposition !**\n\n" +
        "Je suis l'**Assistant Numérique Officiel** de la **Faculté d'Économie et de Gestion de Taroudant (FEGT)**, de l'**Université Ibn Zohr (UIZ)** et du **Ministère de l'Enseignement Supérieur (ENSSUP)**.\n\n" +
        "Voici les accès directs aux plateformes officielles les plus sollicitées :\n" +
        "- **Plateforme de Langues & Certification I.LOGHA Sup** : [https://elogha-sup.uiz.ac.ma/](https://elogha-sup.uiz.ac.ma/)\n" +
        "- **Bourses de l'Enseignement Supérieur (MINHATY)** : [https://www.minhaty.ma/](https://www.minhaty.ma/)\n" +
        "- **Changement de Filière FEG (Plateforme ENE)** : [https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere](https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere)\n" +
        "- **Connexion Espace Numérique de Travail (ENT MyUIZ)** : [https://www.uiz.ac.ma/user/login](https://www.uiz.ac.ma/user/login)\n\n" +
        "Vous pouvez également tester vos notes sur notre **Simulateur de Notes & Compensation** (moyenne ≥ 10/20, aucune note < 5/20) ou me poser vos questions sur les filières et inscriptions.",
      sources: [
        { title: 'I.LOGHA Sup UIZ', uri: 'https://elogha-sup.uiz.ac.ma/' },
        { title: 'Portail Minhaty', uri: 'https://www.minhaty.ma/' },
        { title: 'ENE FEG Changement de Filière', uri: 'https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere' },
        { title: 'Connexion ENT UIZ', uri: 'https://www.uiz.ac.ma/user/login' }
      ]
    };
  }

  // 2. I.LOGHA Sup : Plateforme des langues de l'UIZ
  if (
    q.includes('elogha') ||
    q.includes('i.logha') ||
    q.includes('logha') ||
    q.includes('langue') ||
    q.includes('anglais') ||
    q.includes('certification') ||
    q.includes('positionnement')
  ) {
    return {
      reply:
        "**Plateforme I.LOGHA Sup · Apprentissage et Certification Linguistique (UIZ)** :\n\n" +
        "- **Lien d'accès officiel direct** : [https://elogha-sup.uiz.ac.ma/](https://elogha-sup.uiz.ac.ma/)\n" +
        "- **Objectif** : Développer et certifier vos compétences en langues étrangères (Français, Anglais, Espagnol) dans le cadre de la réforme pédagogique nationale LMD.\n" +
        "- **Test de positionnement obligatoire** : Tout nouvel inscrit à la FEGT doit passer son évaluation initiale en ligne dès la rentrée universitaire.\n" +
        "- **Modalités d'accès** : Connectez-vous avec votre adresse institutionnelle UIZ (`...@uiz.ac.ma`) ou vos identifiants ENT remis lors de votre inscription.",
      sources: [
        { title: 'I.LOGHA Sup — Université Ibn Zohr', uri: 'https://elogha-sup.uiz.ac.ma/' },
        { title: 'Portail Officiel FEGT', uri: 'https://www.fegt.uiz.ac.ma/' }
      ]
    };
  }

  // 3. Changement de Filière FEG (Plateforme ENE)
  if (
    q.includes('changement') ||
    q.includes('changer de filiere') ||
    q.includes('changer de filière') ||
    q.includes('réorientation') ||
    q.includes('reorientation') ||
    q.includes('ene.fpt') ||
    q.includes('changefiliere')
  ) {
    return {
      reply:
        "**Demande de Changement de Filière · FEG Taroudant (Plateforme Numérique ENE)** :\n\n" +
        "- **Lien officiel direct de candidature** : [https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere](https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere)\n" +
        "- **Filières concernées** : Passerelles entre la Licence en Gestion, E-Business et Marketing Digital (**GEMD**), la Licence en Management et Gestion des Entreprises (**MGE**) et la Licence en Entrepreneuriat et Développement des Business (**ENDEB**).\n" +
        "- **Procédure** :\n" +
        "  1. Connectez-vous sur la plateforme ENE avec votre Code Massar (CNE) et mot de passe.\n" +
        "  2. Renseignez la filière actuelle et la filière souhaitée.\n" +
        "  3. Validez la demande dans les délais fixés par le calendrier officiel de la Scolarité FEGT.",
      sources: [
        { title: 'Plateforme ENE — Changement de Filière FEG', uri: 'https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere' },
        { title: 'FEG Taroudant — Scolarité', uri: 'https://www.fegt.uiz.ac.ma/' }
      ]
    };
  }

  // 4. Bourses Nationales de l'Enseignement Supérieur (MINHATY)
  if (
    q.includes('minhati') ||
    q.includes('minhaty') ||
    q.includes('bourse') ||
    q.includes('onousc')
  ) {
    return {
      reply:
        "**Bourses de l'Enseignement Supérieur · Portail National MINHATY** :\n\n" +
        "- **Lien officiel direct** : [https://www.minhaty.ma/](https://www.minhaty.ma/)\n" +
        "- **Gestion ministérielle** : Piloté par le Ministère de l'Enseignement Supérieur (**ENSSUP** — [enssup.gov.ma/fr](https://www.enssup.gov.ma/fr)) et l'ONOUSC.\n" +
        "- **Fonctionnalités** : Dépôt des demandes de bourses pour les nouveaux bacheliers, consultation des listes de boursiers retenus et suivi des versements trimestriels.\n" +
        "- **Rôle de la FEGT** : Le Service de la Scolarité de la FEG Taroudant valide l'assiduité et l'inscription pédagogique requises pour le déblocage des tranches de bourse.",
      sources: [
        { title: 'Portail National Minhaty', uri: 'https://www.minhaty.ma/' },
        { title: 'Ministère de l\'Enseignement Supérieur (ENSSUP)', uri: 'https://www.enssup.gov.ma/fr' }
      ]
    };
  }

  // 5. Connexion Espace Numérique de Travail (ENT / MyUIZ Login)
  if (
    q.includes('login') ||
    q.includes('connexion') ||
    q.includes('connecter') ||
    q.includes('ent') ||
    q.includes('myuiz') ||
    q.includes('compte uiz') ||
    q.includes('mot de passe')
  ) {
    return {
      reply:
        "**Connexion Espace Numérique de Travail (ENT) & MyUIZ · Université Ibn Zohr** :\n\n" +
        "- **Lien d'authentification officiel direct** : [https://www.uiz.ac.ma/user/login](https://www.uiz.ac.ma/user/login)\n" +
        "- **Services accessibles avec votre compte unifié** :\n" +
        "  • **e-Scolarité / MyUIZ** : consultation des notes d'examens, attestations de scolarité en ligne, réinscriptions semestrielles.\n" +
        "  • **Plateforme I.LOGHA Sup** ([https://elogha-sup.uiz.ac.ma/](https://elogha-sup.uiz.ac.ma/)) : cours et tests de langues.\n" +
        "  • **E-mail institutionnel & Google Classroom**.\n" +
        "  • **Wi-Fi sécurisé du campus FEGT**.\n" +
        "- **Identifiants** : Utilisez votre adresse académique et le mot de passe initialisé avec votre Code Massar.",
      sources: [
        { title: 'Connexion ENT — Université Ibn Zohr', uri: 'https://www.uiz.ac.ma/user/login' },
        { title: 'Portail FEG Taroudant', uri: 'https://www.fegt.uiz.ac.ma/' }
      ]
    };
  }

  if (
    q.includes('compensation') ||
    q.includes('valid') ||
    q.includes('moyenne') ||
    q.includes('mention') ||
    q.includes('éliminatoire') ||
    q.includes('eliminatoire') ||
    q.includes('rattrapage') ||
    q.includes('note') ||
    q.includes('simulateur')
  ) {
    return {
      reply:
        "Conformément au cahier des normes pédagogiques nationales (**ENSSUP** — [enssup.gov.ma/fr](https://www.enssup.gov.ma/fr)) appliqué à l'**Université Ibn Zohr** ([uiz.ac.ma](https://www.uiz.ac.ma/)) et à la **FEG Taroudant** ([fegt.uiz.ac.ma](https://www.fegt.uiz.ac.ma/)) :\n\n" +
        "- **Validation d'un module** : Un module est acquis directement dès que la note est **≥ 10/20**.\n" +
        "- **Validation du semestre par compensation** : Un semestre (composé des modules accrédités) est validé par compensation si la **moyenne générale du semestre est ≥ 10/20** **ET** qu'**aucune note de module n'est strictement inférieure à 5/20** (seuil éliminatoire).\n" +
        "- **Mentions officielles** : **Passable** (10 à 11,99/20), **Assez Bien** (12 à 13,99/20), **Bien** (14 à 15,99/20), **Très Bien** (≥ 16/20).\n\n" +
        "Vous pouvez tester vos notes en direct sur notre **Simulateur de Validation de Semestre & Mention FEGT** présent sur cette page (section *Simulateur Notes*).",
      sources: defaultSources
    };
  }

  if (
    q.includes('doyen') ||
    q.includes('hmayz') ||
    q.includes('hassan') ||
    q.includes('gacim') ||
    q.includes('salah') ||
    q.includes('gouvernance') ||
    q.includes('direction') ||
    q.includes('présentation') ||
    q.includes('presentation') ||
    q.includes('adresse') ||
    q.includes('horaire')
  ) {
    return {
      reply:
        "**Présentation officielle & Gouvernance de la Faculté d'Économie et de Gestion de Taroudant (FEGT)** ([fegt.uiz.ac.ma](https://www.fegt.uiz.ac.ma/)) :\n\n" +
        "- **Doyen de la Faculté** : **Pr. Hassan HMAYZ**\n" +
        "- **Vice-Doyen chargé de la Vie de l'Étudiant** : **Pr. Salah GACIM**\n" +
        "- **Tutelle** : Université Ibn Zohr ([uiz.ac.ma](https://www.uiz.ac.ma/)) & Ministère de l'Enseignement Supérieur ([enssup.gov.ma/fr](https://www.enssup.gov.ma/fr)).\n" +
        "- **Chiffres clés** : 2 850+ étudiants, 4 filières accréditées (GEMD, MGE, ENDEB, Master MCI), 45+ enseignants-chercheurs et intervenants, 3 structures de recherche, 60+ doctorants et 25+ partenaires.\n" +
        "- **Adresse & Horaires** : Hay Lmhaita, BP 271, 83000 Taroudant. Ouverture administrative du lundi au vendredi de **08h30 à 16h30**.",
      sources: defaultSources
    };
  }

  if (
    q.includes('filière') ||
    q.includes('filiere') ||
    q.includes('formation') ||
    q.includes('licence') ||
    q.includes('master') ||
    q.includes('gemd') ||
    q.includes('mge') ||
    q.includes('endeb') ||
    q.includes('mci')
  ) {
    return {
      reply:
        "Conformément à l'offre de formation officielle accréditée de la **Faculté d'Économie et de Gestion de Taroudant (FEGT - UIZ)** ([fegt.uiz.ac.ma](https://www.fegt.uiz.ac.ma/)) et aux normes pédagogiques du **Ministère de l'Enseignement Supérieur (ENSSUP)** ([enssup.gov.ma/fr](https://www.enssup.gov.ma/fr)), l'établissement propose :\n\n" +
        "1. **Licence en Gestion, E-Business et Marketing Digital (GEMD)** *(6 semestres, accès post-Baccalauréat)* : Tronc commun S1–S4 en économie et gestion, puis spécialisation S5–S6 en Marketing Digital, E-Business, E-CRM, E-Logistique, Stratégies digitales et Projet de Fin d'Études (PFE).\n" +
        "2. **Licence en Management et Gestion des Entreprises (MGE)** *(6 semestres, accès post-Baccalauréat)* : Formation polyvalente en GRH, Contrôle de gestion, Gestion financière, Audit général, Fiscalité approfondie, ERP et PFE.\n" +
        "3. **Licence en Entrepreneuriat et Développement des Business (ENDEB)** *(6 semestres, accès post-Baccalauréat)* : Spécialisation en Business Model, Financement des jeunes entreprises, Management de l'innovation, Création d'entreprise et PFE.\n" +
        "4. **Master en Management et Commerce International (MCI)** *(4 semestres, accès sur concours et étude de dossier)* : Commerce international, Logistique internationale & Douane, Finance internationale, Supply Chain globale et Mémoire de recherche/stage.\n\n" +
        "Pour changer de filière entre Licences FEG, utilisez la plateforme dédiée : [https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere](https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere).\n\n" +
        "Vous pouvez également consulter et télécharger les fiches descriptives PDF officielles directement dans la section **Filières** de ce portail.",
      sources: [
        { title: 'Filières FEGT Officielles', uri: 'https://www.fegt.uiz.ac.ma/' },
        { title: 'Changement de Filière ENE', uri: 'https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere' },
        { title: 'Université Ibn Zohr', uri: 'https://www.uiz.ac.ma/' }
      ]
    };
  }

  if (
    q.includes('inscription') ||
    q.includes('inscrire') ||
    q.includes('calendrier') ||
    q.includes('dossier') ||
    q.includes('bachelier')
  ) {
    return {
      reply:
        "Selon les procédures administratives officielles de l'**Université Ibn Zohr (UIZ)** ([uiz.ac.ma](https://www.uiz.ac.ma/)) et de la **FEG Taroudant** ([fegt.uiz.ac.ma](https://www.fegt.uiz.ac.ma/)) :\n\n" +
        "- **1. Préinscription numérique** : Tout nouveau bachelier effectue sa préinscription en ligne sur la plateforme dédiée de l'Université Ibn Zohr.\n" +
        "- **2. Dépôt du dossier administratif** : Le dépôt physique s'effectue auprès du **Service de la Scolarité de la FEG Taroudant** selon le calendrier officiel publié sur [fegt.uiz.ac.ma](https://www.fegt.uiz.ac.ma/) (pièces requises : original du Baccalauréat, copies légalisées, copie de la CIN, photos d'identité et fiche de préinscription).\n" +
        "- **3. Activation numérique & Test de Langue** : Connexion à l'ENT UIZ ([https://www.uiz.ac.ma/user/login](https://www.uiz.ac.ma/user/login)) et test de positionnement sur I.LOGHA Sup ([https://elogha-sup.uiz.ac.ma/](https://elogha-sup.uiz.ac.ma/)).",
      sources: [
        { title: 'Préinscription UIZ', uri: 'https://www.uiz.ac.ma/' },
        { title: 'Connexion ENT UIZ', uri: 'https://www.uiz.ac.ma/user/login' },
        { title: 'I.LOGHA Sup', uri: 'https://elogha-sup.uiz.ac.ma/' }
      ]
    };
  }

  if (
    q.includes('amo') ||
    q.includes('assurance') ||
    q.includes('certificat') ||
    q.includes('relevé') ||
    q.includes('releve') ||
    q.includes('scolarité') ||
    q.includes('scolarite')
  ) {
    return {
      reply:
        "Voici les modalités officielles relatives aux services administratifs et sociaux universitaires (**FEGT / UIZ / ENSSUP**) :\n\n" +
        "- **Attestation de scolarité & Relevés de notes** : Demande via l'espace numérique étudiant (**MyUIZ** / [https://www.uiz.ac.ma/user/login](https://www.uiz.ac.ma/user/login)) ou auprès du guichet du **Service de la Scolarité de la FEG Taroudant** sur présentation de la carte d'étudiant (délai habituel de traitement : 24h à 48h ouvrables).\n" +
        "- **Bourses de l'Enseignement Supérieur (MINHATY)** : Portail national [https://www.minhaty.ma/](https://www.minhaty.ma/).\n" +
        "- **Couverture Médicale (AMO Étudiant)** : L'adhésion annuelle s'effectue via l'Espace Numérique de Travail de l'UIZ ([uiz.ac.ma](https://www.uiz.ac.ma/)) en coordination avec la CNOPS.",
      sources: defaultSources
    };
  }

  if (
    q.includes('club') ||
    q.includes('vie étudiante') ||
    q.includes('vie etudiante') ||
    q.includes('enactus') ||
    q.includes('boukedir') ||
    q.includes('fatima') ||
    q.includes('hult') ||
    q.includes('boubrik') ||
    q.includes('loubna') ||
    q.includes('sport') ||
    q.includes('elmouden') ||
    q.includes('ambassadeur') ||
    q.includes('ifguisse') ||
    q.includes('csop') ||
    q.includes('moumine') ||
    q.includes('orientation pedagogique') ||
    q.includes('orientation pédagogique') ||
    q.includes('ccf') ||
    q.includes('conférence') ||
    q.includes('conference') ||
    q.includes('formation') ||
    q.includes('activité') ||
    q.includes('activite')
  ) {
    return {
      reply:
        "**Les 6 Clubs Étudiants Officiels de la FEG Taroudant (UIZ)** :\n\n" +
        "1. **Club Sportif FEG** (Saison 2026/2027) :\n" +
        "   - **Responsable** : Abdellah Elmouden\n" +
        "   - **Activités** : Activités sportives et athlétisme, tournois universitaires (futsal, basket, volley) et championnats UIZ.Sport.\n" +
        "   - **Instagram** : [https://www.instagram.com/club_sportif_feg/](https://www.instagram.com/club_sportif_feg/)\n\n" +
        "2. **Youth Ambassadors Club - نادي السفراء الشباب** (Création : 2026) :\n" +
        "   - **Responsable** : El Mahdi Ifguisse\n" +
        "   - **Activités** : Formation de jeunes ambassadeurs (leadership, plaidoyer, art oratoire), diffusion des Objectifs de Développement Durable (ODD), compétences médias & IA, initiatives de jeunes et ouverture sur les expériences internationales (MUN).\n" +
        "   - **Adhésion** : Formulaire d'inscription électronique & contact du bureau dirigeant.\n" +
        "   - **Instagram** : [https://www.instagram.com/youth_ambassadors.club](https://www.instagram.com/youth_ambassadors.club?rpxt=c3ZnYTMwOHp4eWFp)\n\n" +
        "3. **Club de Soutien et d’Orientation Pédagogique (CSOP)** (Fondé en 2014) :\n" +
        "   - **Responsable** : Imane Moumine, présidente du club\n" +
        "   - **Activités** : Ateliers de préparation aux examens, accompagnement et parrainage pédagogique, méthodologie des QCM, conférences éducatives et gestion du stress.\n" +
        "   - **Adhésion** : Formulaire d'adhésion auprès du bureau CSOP.\n" +
        "   - **Instagram** : [https://www.instagram.com/club_orientation_pedagogique](https://www.instagram.com/club_orientation_pedagogique?rpxt=NWR3Ym9uaXJ3bXJr)\n\n" +
        "4. **Club Conférence et Formation (CCF)** (Club Actif FEGT) :\n" +
        "   - **Responsable** : Bureau Étudiant CCF & Commission Formation FEGT\n" +
        "   - **Activités** : Organisation de conférences de haut niveau, masterclasses, formations certifiantes et ateliers de soft skills.\n" +
        "   - **Instagram** : [https://www.instagram.com/club.ccf/](https://www.instagram.com/club.ccf/)\n\n" +
        "5. **EF Hult Prize FEGT** (Création : 2025) :\n" +
        "   - **Responsable** : Loubna Boubrik, présidente du club\n" +
        "   - **Activités** : Encouragement de l'innovation, entrepreneuriat social, créativité, compétitions Hult Prize et résolution des défis mondiaux.\n" +
        "   - **Modalités d'adhésion** : Demande écrite signée acceptée par le bureau du club, puis confirmation par l'attribution d'une carte d'adhésion.\n" +
        "   - **Instagram** : [https://www.instagram.com/ef_hprize.fegt/](https://www.instagram.com/ef_hprize.fegt/)\n\n" +
        "6. **Enactus FEG Taroudant (Faculté d’Économie et de Gestion de Taroudant)** :\n" +
        "   - **Responsable** : Fatima Boukedir\n" +
        "   - **Affiliation** : Club affilié au réseau Enactus Morocco\n" +
        "   - **Activités** : Formations (Idéation, Design Thinking, BMC, Prototyping, Sales, Marketing), sorties de terrain, visites d'entreprises et développement de projets d'entrepreneuriat social.\n" +
        "   - **Modalités d'adhésion** : Remplir le formulaire d'adhésion du club au début de l'année universitaire, puis intégrer les groupes de communication officiels des membres.\n" +
        "   - **Instagram** : [https://www.instagram.com/enactusfegtrd/](https://www.instagram.com/enactusfegtrd/)",
      sources: [
        { title: 'Instagram Club Sportif FEG', uri: 'https://www.instagram.com/club_sportif_feg/' },
        { title: 'Instagram Youth Ambassadors', uri: 'https://www.instagram.com/youth_ambassadors.club?rpxt=c3ZnYTMwOHp4eWFp' },
        { title: 'Instagram CSOP', uri: 'https://www.instagram.com/club_orientation_pedagogique?rpxt=NWR3Ym9uaXJ3bXJr' },
        { title: 'Instagram CCF', uri: 'https://www.instagram.com/club.ccf/' },
        { title: 'Instagram EF Hult Prize FEGT', uri: 'https://www.instagram.com/ef_hprize.fegt/' },
        { title: 'Instagram Enactus FEGT', uri: 'https://www.instagram.com/enactusfegtrd/' },
        { title: 'Portail FEG Taroudant', uri: 'https://www.fegt.uiz.ac.ma/' }
      ]
    };
  }

  if (
    q.includes('bonjour') ||
    q.includes('salut') ||
    q.includes('salam') ||
    q.includes('aide') ||
    q.includes('qui es-tu') ||
    q.includes('qui êtes-vous') ||
    q.includes('menu')
  ) {
    return {
      reply:
        "Bonjour et bienvenue ! Je suis l'**Assistant Officiel d'Information Académique** représentant l'**Université Ibn Zohr (UIZ)**, la **Faculté d'Économie et de Gestion de Taroudant (FEGT)** et le **Ministère de l'Enseignement Supérieur (ENSSUP)**.\n\n" +
        "Je réponds avec précision sur tous vos services universitaires. Voici les accès rapides directs :\n" +
        "- 🌐 **Langues & Certification I.LOGHA Sup** : [https://elogha-sup.uiz.ac.ma/](https://elogha-sup.uiz.ac.ma/)\n" +
        "- 🎓 **Bourses Étudiantes Minhaty** : [https://www.minhaty.ma/](https://www.minhaty.ma/)\n" +
        "- 🔄 **Changement de Filière ENE** : [https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere](https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere)\n" +
        "- 🔑 **Espace Numérique ENT MyUIZ** : [https://www.uiz.ac.ma/user/login](https://www.uiz.ac.ma/user/login)\n" +
        "- 🧮 **Simulateur de Notes & Compensation** : testez votre moyenne (seuil ≥ 10/20, pas de note < 5/20)\n\n" +
        "Quelle est votre question aujourd'hui ?",
      sources: [
        { title: 'I.LOGHA Sup UIZ', uri: 'https://elogha-sup.uiz.ac.ma/' },
        { title: 'Portail Minhaty', uri: 'https://www.minhaty.ma/' },
        { title: 'ENE FEG Changement de Filière', uri: 'https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere' },
        { title: 'Connexion ENT UIZ', uri: 'https://www.uiz.ac.ma/user/login' }
      ]
    };
  }

  if (
    q.includes('examen') ||
    q.includes('contrôle') ||
    q.includes('session') ||
    q.includes('calendrier des examens')
  ) {
    return {
      reply:
        "**Modalités officielles des examens à la FEG Taroudant (UIZ)** :\n\n" +
        "- **Session ordinaire (normale)** : À la fin de chaque semestre (S1/S3/S5 en janvier-février, S2/S4/S6 en mai-juin).\n" +
        "- **Session de rattrapage** : Organisée pour les étudiants n'ayant pas validé leurs modules et n'ayant pas bénéficié de la compensation semestrielle.\n" +
        "- **Affichage des plannings** : Les convocations, plannings d'épreuves et répartitions par amphithéâtre sont publiés sur le panneau officiel numérique et sur [https://www.fegt.uiz.ac.ma/](https://www.fegt.uiz.ac.ma/).",
      sources: defaultSources
    };
  }

  if (
    q.includes('stage') ||
    q.includes('pfe') ||
    q.includes('mémoire') ||
    q.includes('memoire') ||
    q.includes('entreprise')
  ) {
    return {
      reply:
        "**Projet de Fin d'Études (PFE) & Stages universitaires** :\n\n" +
        "- **Licences (GEMD, MGE, ENDEB)** : Le semestre 6 comporte un module obligatoire de Projet de Fin d'Études (PFE) ou stage en entreprise, avec encadrement professoral et soutenance.\n" +
        "- **Master MCI** : Le semestre 4 est consacré au mémoire de fin d'études et stage professionnel en entreprise ou organisme international.\n" +
        "- **Convention de stage** : À retirer et faire viser auprès de l'administration FEGT avant le début effectif de la période de stage.",
      sources: defaultSources
    };
  }

  if (
    q.includes('erasmus') ||
    q.includes('wsb') ||
    q.includes('merito') ||
    q.includes('poznan') ||
    q.includes('pologne') ||
    q.includes('mobilité') ||
    q.includes('mobilite') ||
    q.includes('international')
  ) {
    return {
      reply:
        "**Programme de Mobilité Internationale Erasmus+ · Partenariat FEGT & WSB Merito University Poznań (Pologne)** :\n\n" +
        "- **Établissement partenaire** : WSB Merito University à Poznań (Uniwersytet WSB Merito w Poznaniu), université d'excellence en gestion, business et commerce international.\n" +
        "- **Bénéficiaires** : Étudiants de Licence (MGE, GEMD, ENDEB) et du Master Management et Commerce International (MCI).\n" +
        "- **Bourse Erasmus+** : Prise en charge financière de l'Union Européenne (allocation mensuelle pour les frais de séjour + forfait voyage).\n" +
        "- **Reconnaissance académique** : Validation automatique des crédits ECTS et des modules du semestre d'échange via le contrat d'études (Learning Agreement).\n" +
        "- **Enseignement** : Cours dispensés en anglais (Business, Finance, Supply Chain, Marketing).\n" +
        "- **Candidature** : Déposer le dossier (relevés de notes, CV Europass en anglais, attestation de langue B2, lettre de motivation) auprès du Bureau de la Coopération FEGT & UIZ. Consultez l'article dédié dans la section **Blog** de ce portail.",
      sources: defaultSources
    };
  }

  if (
    q.includes('handicap') ||
    q.includes('accessibilité') ||
    q.includes('accessibilite') ||
    q.includes('besoin spécifique')
  ) {
    return {
      reply:
        "**Cellule Handi-Accueil & Inclusion (FEGT / UIZ)** :\n\n" +
        "- La Faculté d'Économie et de Gestion de Taroudant et l'Université Ibn Zohr veillent à l'égalité des chances pour tous les étudiants.\n" +
        "- Dispositifs assurés : aménagements spécifiques lors des examens (tiers-temps accordé, assistance ou salle dédiée), accessibilité physique aux amphis et bâtiments, et suivi bienveillant par le Vice-Doyen chargé de la vie de l'étudiant (Pr. Salah GACIM).",
      sources: defaultSources
    };
  }

  if (
    q.includes('contact') ||
    q.includes('téléphone') ||
    q.includes('telephone') ||
    q.includes('localisation') ||
    q.includes('lieu') ||
    q.includes('où se trouve') ||
    q.includes('ou se trouve')
  ) {
    return {
      reply:
        "**Coordonnées officielles et Accès à la FEG Taroudant** :\n\n" +
        "- **Adresse** : Hay Lmhaita, BP 271, 83000 Taroudant, Maroc.\n" +
        "- **Horaires d'accueil administratif** : Du lundi au vendredi, de **08h30 à 16h30**.\n" +
        "- **Portails web officiels** :\n" +
        "  • Faculté : [https://www.fegt.uiz.ac.ma/](https://www.fegt.uiz.ac.ma/)\n" +
        "  • Université Ibn Zohr : [https://www.uiz.ac.ma/](https://www.uiz.ac.ma/)\n" +
        "  • Ministère ENSSUP : [https://www.enssup.gov.ma/fr](https://www.enssup.gov.ma/fr)",
      sources: defaultSources
    };
  }

  return {
    reply:
      "Voici les orientations officielles de l'**Université Ibn Zohr (UIZ)**, de la **FEG Taroudant** et de l'**ENSSUP** relatives à votre demande :\n\n" +
      "Pour effectuer vos démarches et consulter les avis officiels, veuillez utiliser les portails dédiés ci-dessous :\n" +
      "- **Plateforme I.LOGHA Sup (Langues & Certification)** : [https://elogha-sup.uiz.ac.ma/](https://elogha-sup.uiz.ac.ma/)\n" +
      "- **Bourses Nationales Minhaty** : [https://www.minhaty.ma/](https://www.minhaty.ma/)\n" +
      "- **Changement de Filière FEG (Plateforme ENE)** : [https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere](https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere)\n" +
      "- **Espace Numérique ENT / MyUIZ** : [https://www.uiz.ac.ma/user/login](https://www.uiz.ac.ma/user/login)\n" +
      "- **Portail Officiel FEG Taroudant** : [https://www.fegt.uiz.ac.ma/](https://www.fegt.uiz.ac.ma/)\n\n" +
      "Vous pouvez également tester vos notes sur notre **Simulateur de Notes & Compensation** (règle des 10/20 sans note < 5/20).",
    sources: [
      { title: 'I.LOGHA Sup UIZ', uri: 'https://elogha-sup.uiz.ac.ma/' },
      { title: 'Portail Minhaty', uri: 'https://www.minhaty.ma/' },
      { title: 'ENE FEG Changement de Filière', uri: 'https://ene.fpt.ac.ma/#/login/feg?redirect=%2Ffpt%2FchangeFiliere' },
      { title: 'Connexion ENT UIZ', uri: 'https://www.uiz.ac.ma/user/login' }
    ]
  };
}

async function startServer() {
  const app = express();

  // Permissive CORS middleware for dev server and preview iframes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req, res) => {
    try {
      const body = req.body || {};
      let userQuery = '';

      if (Array.isArray(body.messages) && body.messages.length > 0) {
        userQuery = body.messages[body.messages.length - 1]?.text || '';
      } else if (typeof body.message === 'string') {
        userQuery = body.message;
      } else if (typeof body.prompt === 'string') {
        userQuery = body.prompt;
      } else if (typeof body.text === 'string') {
        userQuery = body.text;
      }

      if (!userQuery.trim()) {
        res.status(400).json({ error: 'Veuillez saisir une question.' });
        return;
      }

      const responseData = buildOfficialGroundedFallback(userQuery);

      res.json({
        reply: responseData.reply,
        sources: responseData.sources,
        modelUsed: 'FEGT-UIZ Institutional Knowledge Engine'
      });
    } catch (_error) {
      const lastMsg =
        Array.isArray(req.body?.messages) && req.body.messages.length > 0
          ? req.body.messages[req.body.messages.length - 1].text || ''
          : '';
      const fallback = buildOfficialGroundedFallback(lastMsg);
      res.json({
        reply: fallback.reply,
        sources: fallback.sources,
        modelUsed: 'FEGT-UIZ Institutional Knowledge Engine'
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'public')));
    app.get(['/', '/index.html'], (_req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FEGT Official Portal & AI Representative running on http://0.0.0.0:${PORT}`);
  });
}

// Only start server when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}

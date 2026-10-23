import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterBlogArticles,
  calculateStepperProgress,
  searchGuideItems,
  getNextCarouselIndex,
  getFormationPdfPath
} from './guideLogic';

const sampleArticles = [
  {
    id: 'semaine-etudiant',
    category: 'Événements UIZ',
    title: "Préparez la 2ème édition de la Semaine de l'Étudiant (Mars 2027)",
    excerpt: 'Théâtre, poésie, photographie, musique, court-métrage et compétitions sportives.'
  },
  {
    id: 'ia-recherches',
    category: 'Réussite & Stages',
    title: "Comment bien utiliser l'IA dans vos recherches universitaires",
    excerpt: "Décryptage de la charte d'usage responsable et transparent de l'IA à la FEGT."
  },
  {
    id: 'enactus-impact',
    category: 'Vie des Clubs',
    title: 'ENACTUS FEGT : 3 projets à impact social primés dans le Souss-Massa',
    excerpt: "L'entrepreneuriat social étudiant au service du territoire de Taroudant."
  }
];

test('filterBlogArticles returns all articles when category is Tous', () => {
  const res = filterBlogArticles(sampleArticles, 'Tous');
  assert.equal(res.length, 3);
});

test('filterBlogArticles filters accurately by specific category and search query', () => {
  const byCategory = filterBlogArticles(sampleArticles, 'Événements UIZ');
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].id, 'semaine-etudiant');

  const byQuery = filterBlogArticles(sampleArticles, 'Tous', 'charte');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'ia-recherches');
});

test('calculateStepperProgress computes percentage accurately across 7 steps', () => {
  assert.equal(calculateStepperProgress(1, 7), 14);
  assert.equal(calculateStepperProgress(4, 7), 57);
  assert.equal(calculateStepperProgress(7, 7), 100);
  assert.equal(calculateStepperProgress(10, 7), 100);
});

test('searchGuideItems matches across title, description, section, and tags', () => {
  const index = [
    {
      title: 'Bourses MINHATI',
      description: 'Suivi du dossier social et versement des bourses universitaires.',
      section: 'Services Numériques',
      tags: ['bourse', 'minhati', 'aide']
    },
    {
      title: 'Certificat de scolarité',
      description: 'Retrait en ligne sur MyUIZ ou auprès du guichet e-Scolarité.',
      section: 'Mes Démarches',
      tags: ['attestation', 'scolarite']
    }
  ];

  assert.equal(searchGuideItems(index, '').length, 0);
  assert.equal(searchGuideItems(index, 'minhati').length, 1);
  assert.equal(searchGuideItems(index, 'attestation').length, 1);
});

test('getNextCarouselIndex wraps around forward and backward cleanly', () => {
  assert.equal(getNextCarouselIndex(0, 1, 21), 1);
  assert.equal(getNextCarouselIndex(20, 1, 21), 0);
  assert.equal(getNextCarouselIndex(0, -1, 21), 20);
});

test('getFormationPdfPath returns the exact official PDF path for each formation', () => {
  assert.equal(getFormationPdfPath('gemd'), '/assets/aistudio/GEMD_4243125d.pdf');
  assert.equal(getFormationPdfPath('mge'), '/assets/aistudio/MGE_3b29ff21.pdf');
  assert.equal(getFormationPdfPath('endeb'), '/assets/aistudio/ENDEB_d265f5e0.pdf');
  assert.equal(getFormationPdfPath('mci'), '/assets/aistudio/MCI_580fbc3e.pdf');
});


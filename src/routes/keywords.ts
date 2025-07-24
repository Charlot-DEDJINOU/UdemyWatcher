import { Router, Request, Response } from 'express';
import { Keyword } from '../models/Keyword';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Keyword:
 *       type: object
 *       required:
 *         - keyword
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré
 *         keyword:
 *           type: string
 *           description: Mot-clé à rechercher
 *         isActive:
 *           type: boolean
 *           description: Si le mot-clé est actif
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastScrapedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/keywords:
 *   get:
 *     summary: Récupère tous les mots-clés
 *     tags: [Keywords]
 *     responses:
 *       200:
 *         description: Liste des mots-clés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Keyword'
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const keywords = await Keyword.find().sort({ createdAt: -1 });
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des mots-clés' });
  }
});

/**
 * @swagger
 * /api/keywords:
 *   post:
 *     summary: Ajoute un nouveau mot-clé
 *     tags: [Keywords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keyword
 *             properties:
 *               keyword:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Mot-clé créé avec succès
 *       400:
 *         description: Mot-clé déjà existant ou invalide
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { keyword, isActive = true } = req.body;

    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Le mot-clé est requis' });
    }

    const existingKeyword = await Keyword.findOne({ keyword: keyword.trim() });
    if (existingKeyword) {
      return res.status(400).json({ error: 'Ce mot-clé existe déjà' });
    }

    const newKeyword = new Keyword({
      keyword: keyword.trim(),
      isActive
    });

    await newKeyword.save();
    res.status(201).json(newKeyword);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du mot-clé' });
  }
});

/**
 * @swagger
 * /api/keywords/{id}:
 *   delete:
 *     summary: Supprime un mot-clé
 *     tags: [Keywords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mot-clé supprimé avec succès
 *       404:
 *         description: Mot-clé non trouvé
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const keyword = await Keyword.findByIdAndDelete(req.params.id);
    if (!keyword) {
      return res.status(404).json({ error: 'Mot-clé non trouvé' });
    }
    res.json({ message: 'Mot-clé supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du mot-clé' });
  }
});

/**
 * @swagger
 * /api/keywords/{id}/toggle:
 *   patch:
 *     summary: Active/désactive un mot-clé
 *     tags: [Keywords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut du mot-clé modifié
 *       404:
 *         description: Mot-clé non trouvé
 */
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const keyword = await Keyword.findById(req.params.id);
    if (!keyword) {
      return res.status(404).json({ error: 'Mot-clé non trouvé' });
    }

    keyword.isActive = !keyword.isActive;
    await keyword.save();

    res.json(keyword);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la modification du mot-clé' });
  }
});

export default router;
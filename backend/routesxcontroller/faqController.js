import { pool } from '../../db.js';

export const getFaqsPublic = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, question AS title, answer AS html, userid, updated_at FROM faqs ORDER BY updated_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('[FAQ] getFaqsPublic error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs' });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body; // question = title, answer = HTML content
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'question and answer are required' });
    }
    const userid = req.session?.user?.userid || null;
    await pool.query(
      'INSERT INTO faqs (question, answer, userid, updated_at) VALUES ($1,$2,$3,NOW())',
      [question, answer, userid]
    );
    res.status(201).json({ success: true, message: 'FAQ added' });
  } catch (error) {
    console.error('[FAQ] createFaq error:', error);
    res.status(500).json({ success: false, message: 'Failed to add FAQ' });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    await pool.query(
      'UPDATE faqs SET question=$1, answer=$2, updated_at=NOW() WHERE id=$3',
      [question, answer, id]
    );
    res.json({ success: true, message: 'FAQ updated' });
  } catch (error) {
    console.error('[FAQ] updateFaq error:', error);
    res.status(500).json({ success: false, message: 'Failed to update FAQ' });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM faqs WHERE id=$1', [id]);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('[FAQ] deleteFaq error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete FAQ' });
  }
};

export const uploadFaqImageHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Path publik relatif dari folder public
    const normalized = req.file.path.replace(/\\/g, '/');
    const publicIndex = normalized.indexOf('public/');
    const publicPath = publicIndex >= 0 ? normalized.substring(publicIndex + 7) : normalized;
    res.json({ success: true, url: `/${publicPath}` });
  } catch (error) {
    console.error('[FAQ] uploadFaqImage error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

import { pool } from '../../db.js';

export const getActiveNotice = async (req,res)=>{
  const { rows } = await pool.query('SELECT * FROM notices WHERE active=true LIMIT 1');
  res.json(rows[0] || null);
};

export const updateNotice = async (req,res)=>{
  const { content, active } = req.body;
  // hanya 1 notice aktif
  await pool.query('UPDATE notices SET active=false');
  await pool.query(
    'INSERT INTO notices (content, active) VALUES ($1,$2)',
    [content, active]
  );
  res.json({message:'Notice updated'});
};

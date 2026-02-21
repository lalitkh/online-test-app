/**
 * One-time migration script: reads existing public/*.json quiz files
 * and inserts them into Supabase `subjects` and `questions` tables.
 *
 * Usage:
 *   1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file at the project root.
 *   2. Run: npx tsx scripts/seed-supabase.ts
 *
 * Prerequisites:
 *   npm install tsx dotenv  (dev dependencies, one-time)
 *
 * This script is idempotent for subjects (upserts by id) but will
 * INSERT questions each time — run it only once per fresh database.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Anon key:     ${supabaseKey.slice(0, 10)}...${supabaseKey.slice(-5)}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Subject definitions (mirrored from the old src/data/subjects.ts) ──
const subjectDefs = [
  { id: 'dcl_iq_gk1', name: 'DCL IQ GK-1', file: 'dcl_iq_gk1.json' },
  { id: 'dcl_iq_gk2', name: 'DCL IQ GK-2', file: 'dcl_iq_gk2.json' },
  { id: 'dcl_iq_gk3', name: 'DCL IQ GK-3', file: 'dcl_iq_gk3.json' },
  { id: 'dcl_iq_gk4', name: 'DCL IQ GK-4', file: 'dcl_iq_gk4.json' },
  { id: 'dcl_iq_math', name: 'DCL IQ Math', file: 'dcl_iq_math.json' },
  { id: 'dcl_iq_mock1', name: 'DCL IQ Mock Test 1', file: 'dcl_iq_mock1.json' },
  { id: 'dcl_iq_mock2', name: 'DCL IQ Mock Test 2', file: 'dcl_iq_mock2.json' },
  { id: 'dcl_iq_mock3', name: 'DCL IQ Mock Test 3', file: 'dcl_iq_mock3.json' },
  { id: 'dcl_iq_mock4', name: 'DCL IQ Mock Test 4', file: 'dcl_iq_mock4.json' },
  { id: 'dcl_model_test', name: 'DCL IQ Model Test', file: 'dcl_model_test.json' },
  { id: 'kisa_set1', name: 'KISA Set-1', file: 'kisa_set1.json' },
  { id: 'kisa_set2', name: 'KISA Set-2', file: 'kisa_set2.json' },
  { id: 'kisa_set3', name: 'KISA Set-3', file: 'kisa_set3.json' },
  { id: 'india_quiz_set1', name: 'India Quiz Set 1', file: 'india_quiz_set1.json' },
  { id: 'india_quiz_set2', name: 'India Quiz Set 2', file: 'india_quiz_set2.json' },
  { id: 'sample', name: 'Sample Test', file: 'sample.json' },
];

const PUBLIC_DIR = join(import.meta.dirname ?? '.', '..', 'public');

interface QuizJson {
  title: string;
  duration: number;
  passingScore?: number;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    topic?: string;
  }[];
}

async function main() {
  // Test connection first
  console.log('Testing Supabase connection...');
  try {
    const { error: testErr } = await supabase.from('subjects').select('id').limit(1);
    if (testErr) {
      console.error(`Connection test failed: ${testErr.message}`);
      console.error('Make sure your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct.');
      console.error('Also verify the tables have been created (run the SQL from README.md).');
      process.exit(1);
    }
    console.log('Connection OK!\n');
  } catch (err) {
    console.error('Connection failed with error:', err);
    console.error('\nCheck that your VITE_SUPABASE_URL is correct (should be https://XXXXX.supabase.co)');
    process.exit(1);
  }

  console.log('Seeding Supabase...\n');

  for (let i = 0; i < subjectDefs.length; i++) {
    const def = subjectDefs[i];
    const filePath = join(PUBLIC_DIR, def.file);

    if (!existsSync(filePath)) {
      console.warn(`⚠  Skipping ${def.id}: file ${def.file} not found`);
      continue;
    }

    const raw = readFileSync(filePath, 'utf-8');
    const quiz: QuizJson = JSON.parse(raw);

    // Upsert subject
    const { error: subErr } = await supabase.from('subjects').upsert(
      {
        id: def.id,
        name: def.name,
        is_active: true,
        display_order: i + 1,
        duration: quiz.duration,
        passing_score: quiz.passingScore ?? 90,
      },
      { onConflict: 'id' }
    );

    if (subErr) {
      console.error(`✗  Subject ${def.id}: ${subErr.message}`);
      console.error('   Details:', JSON.stringify(subErr));
      continue;
    }
    console.log(`✓  Subject: ${def.name}`);

    // Insert questions
    const rows = quiz.questions.map((q) => ({
      subject_id: def.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      topic: q.topic ?? null,
    }));

    const { error: qErr } = await supabase.from('questions').insert(rows);

    if (qErr) {
      console.error(`   ✗  Questions for ${def.id}: ${qErr.message}`);
    } else {
      console.log(`   ✓  ${rows.length} questions inserted`);
    }
  }

  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

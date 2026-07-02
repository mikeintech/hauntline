import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://api.elevenlabs.io/v1/sound-generation';
const OUT_DIR = path.resolve('assets/audio/elevenlabs-candidates');
const localEnv = await readFile('.env.local', 'utf8').catch(() => '');
const localVars = Object.fromEntries(localEnv.split(/\r?\n/).flatMap(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return [];
  const [key, ...value] = trimmed.split('=');
  return [[key.trim(), value.join('=').trim()]];
}));
const API_KEY = process.env.ELEVENLABS_API_KEY || localVars.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY in environment or .env.local.');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

const payloadBase = {
  duration_seconds: 0.7,
  prompt_influence: 0.72,
  loop: false,
  model_id: 'eleven_text_to_sound_v2',
  output_format: 'mp3_44100_128'
};

const prompts = [
  'Adult male forceful exhale for a haunted dash game, like releasing held breath into a forward push of wind. Deep human breath, soft chest pressure release, fast airy expulsion, rounded whoosh, no hard punch, no grunt, no cough, no words, no child voice, no scream, no weapon, no music. Satisfying physical air burst with a smooth tail.',
  'Cinematic male breath release for a small ghost character launching forward. A controlled deep exhale turning into a smooth gust of air, pressure let go, soft wind push, warm breath texture, no impact hit, no slap, no cartoon, no robot, no spoken voice, no shout. Clean mobile game dash release, airy and tactile.'
];

for (let i = 0; i < prompts.length; i++) {
  const candidate = i + 1;
  const payload = { ...payloadBase, text: prompts[i] };
  console.log(`Generating player_male_dash_exhale_wind candidate ${candidate}/2...`);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ElevenLabs failed for candidate ${candidate}: ${response.status} ${message}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const file = path.join(OUT_DIR, `player_male_dash_exhale_wind__c${String(candidate).padStart(2, '0')}.mp3`);
  await writeFile(file, buffer);
  console.log(`Saved ${file}`);
}

console.log(`Done. Review candidates in ${OUT_DIR}`);

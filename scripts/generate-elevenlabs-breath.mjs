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

const assets = [
  {
    name: 'player_male_charge_inhale',
    duration_seconds: 0.85,
    prompt_influence: 0.7,
    text: 'Adult male inhale for a haunted dash game character charging power. Deep human chest breath, quick controlled intake, close-mic physical air pull, low throat resonance, serious and cinematic. No words, no child voice, no cartoon squeak, no monster growl, no robot, no scream, no music. Warm saturated game sound, short and responsive.'
  },
  {
    name: 'player_male_dash_exhale',
    duration_seconds: 0.55,
    prompt_influence: 0.7,
    text: 'Adult male exhale release for a haunted dash game character launching forward. Forceful deep breath burst, controlled physical exhale, low chest impact, fast air whoosh, satisfying body punch, short warm tail. No words, no child voice, no cartoon, no scream, no robot, no weapon, no music. Cinematic but clean for mobile gameplay.'
  }
];

if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY in environment or .env.local.');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

for (const asset of assets) {
  for (let i = 1; i <= 2; i++) {
    const payload = {
      text: asset.text,
      duration_seconds: asset.duration_seconds,
      prompt_influence: asset.prompt_influence,
      loop: false,
      model_id: 'eleven_text_to_sound_v2',
      output_format: 'mp3_44100_128'
    };

    console.log(`Generating ${asset.name} candidate ${i}/2...`);
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
      throw new Error(`ElevenLabs failed for ${asset.name} candidate ${i}: ${response.status} ${message}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const file = path.join(OUT_DIR, `${asset.name}__c${String(i).padStart(2, '0')}.mp3`);
    await writeFile(file, buffer);
    console.log(`Saved ${file}`);
  }
}

console.log(`Done. Review candidates in ${OUT_DIR}`);

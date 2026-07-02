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
const CANDIDATES = Number(process.env.CANDIDATES || 3);

const assets = [
  {
    name: 'ambience_askreddit_loop',
    duration_seconds: 12,
    loop: true,
    prompt_influence: 0.35,
    text: 'Seamless looping haunted game ambience for a tiny Reddit ghost room, restless but soft. Low warm room tone, faint spectral murmurs, distant thread-like whispers, subtle dusty air movement, gentle tension, no melody, no jump scare, no loud impacts, no recognizable words. Polished mobile game audio, dark cozy haunted atmosphere, loopable, restrained, immersive.'
  },
  {
    name: 'ambience_aita_loop',
    duration_seconds: 12,
    loop: true,
    prompt_influence: 0.35,
    text: 'Seamless looping haunted courtroom ambience for a playful ghost puzzle game. Low wooden room creaks, soft judgmental murmurs, distant gavel-like resonance far in the background, restrained tension, warm dark tone, no clear speech, no music, no sudden hits. Feels like Murmur is watching and evaluating every move.'
  },
  {
    name: 'ambience_nosleep_loop',
    duration_seconds: 12,
    loop: true,
    prompt_influence: 0.35,
    text: 'Seamless looping horror bedtime room ambience, quiet and unsettling but not loud. Deep filtered room tone, faint blanket rustle, distant breath, soft paranormal pressure, occasional barely audible floor creak, no jump scare, no melody, no spoken words. Dreamlike, foggy, intimate, haunted mobile game atmosphere.'
  },
  {
    name: 'player_charge_inhale',
    duration_seconds: 1.2,
    loop: false,
    prompt_influence: 0.6,
    text: 'A small ghost child inhaling supernatural air before dashing, cute but eerie. Deep soft inhale, rounded throat tone, subtle ghostly vowel, no words, no scream, no robot synth, no harsh hiss. The sound rises in tension and volume over one second, warm saturated, satisfying, creature-like, playful haunted game feel.'
  },
  {
    name: 'player_dash_release',
    duration_seconds: 0.55,
    loop: false,
    prompt_influence: 0.55,
    text: 'A small ghost child suddenly releasing built-up air into a fast dash. Soft explosive exhale, airy whoosh, little body punch, warm magical tail, satisfying but not harsh. No robot sound, no weapon, no sci-fi laser. Should feel physical, cute, powerful, and haunted, like a blob ghost launching across a room.'
  },
  {
    name: 'wall_hit',
    duration_seconds: 0.5,
    loop: false,
    prompt_influence: 0.5,
    text: 'Soft but impactful cartoon ghost blob hitting a stone wall. Rounded thump, compressed air puff, tiny rubbery body squash, faint stone resonance, no pain scream, no slapstick boing. It should feel satisfying and physical, not violent, with a short warm tail suitable for repeated mobile game collisions.'
  },
  {
    name: 'ghost_body_kill',
    duration_seconds: 0.9,
    loop: false,
    prompt_influence: 0.55,
    text: 'A player ghost collides with a dangerous replay ghost and dissolves. Soft spectral impact, chilly suction, tiny gasp-like ghost voice with no words, dusty magical poof, dark but playful. Not gory, not loud horror. Clear failure feedback with emotional weight and a short haunted tail.'
  },
  {
    name: 'near_miss_shimmer',
    duration_seconds: 0.5,
    loop: false,
    prompt_influence: 0.5,
    text: 'A very close ghost near-miss in a haunted puzzle game. Delicate icy shimmer, tiny air sparkle, quick nervous flutter, subtle magical glint. Short, satisfying, readable as danger avoided. No coin sound, no UI beep, no melody, no harsh high frequencies.'
  },
  {
    name: 'bell_escape_ring',
    duration_seconds: 2.8,
    loop: false,
    prompt_influence: 0.6,
    text: 'A golden haunted victory bell ringing in a cozy dark ghost room. Warm brass bell strike, rich resonant decay, magical glow, tiny sparkling tail, triumphant but not orchestral. Should feel like escape and relief after tension. Polished mobile game reward sound, clear and memorable.'
  },
  {
    name: 'curse_place_stamp',
    duration_seconds: 0.75,
    loop: false,
    prompt_influence: 0.55,
    text: 'A curse token being stamped onto a haunted tile by a grumpy little demon clerk. Wooden stamp impact, soft magical seal pulse, dusty parchment texture, tiny supernatural sparkle. Satisfying and official, like Murmur approving tomorrow\'s haunt. No voice, no music, short and clear.'
  },
  {
    name: 'ui_tick',
    duration_seconds: 0.5,
    loop: false,
    prompt_influence: 0.5,
    text: 'Restrained tactile UI click for a haunted mobile game. Soft wooden-talisman tap with tiny magical edge, very short, warm, not electronic, not arcade, not loud. Should work for buttons, debug menu, and small selections without annoying repetition.'
  },
  {
    name: 'murmur_stamp',
    duration_seconds: 0.5,
    loop: false,
    prompt_influence: 0.55,
    text: 'A grumpy demon clerk slamming a small stamp on a desk in a haunted office. Short wooden knock, desk resonance, tiny paper slap, faint magical authority. Dry, funny, official, satisfying. No spoken voice, no metal clang, no huge impact.'
  },
  {
    name: 'bat_wake',
    duration_seconds: 0.7,
    loop: false,
    prompt_influence: 0.55,
    text: 'A sleepy tiny bat wakes up in a haunted puzzle room. Soft wing flutter, tiny annoyed squeak, little dusty movement, playful spooky tone. Not scary, not realistic horror, not loud. Distinct from ghosts and UI sounds, short and readable.'
  },
  {
    name: 'false_coin_poof',
    duration_seconds: 0.65,
    loop: false,
    prompt_influence: 0.55,
    text: 'A cursed false coin disappointingly vanishes in a haunted mobile game. Tiny fake coin glint, soft magical fizzle, hollow little poof, playful disappointment. No cash register, no arcade coin pickup, no melody. Short, readable, warm, slightly mischievous.'
  }
];

if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY. Run with: ELEVENLABS_API_KEY=... node scripts/generate-elevenlabs-sfx.mjs');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

for (const asset of assets) {
  for (let i = 1; i <= CANDIDATES; i++) {
    const payload = {
      text: asset.text,
      duration_seconds: asset.duration_seconds,
      prompt_influence: asset.prompt_influence,
      loop: asset.loop,
      model_id: 'eleven_text_to_sound_v2',
      output_format: 'mp3_44100_128'
    };

    console.log(`Generating ${asset.name} candidate ${i}/${CANDIDATES}...`);
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

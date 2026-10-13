export interface FictionalCure {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  symptoms: {
    primaryPhysical: string;
    speechPattern: string;
    behavioralTrigger: string;
    summary: string;
  };
}

export interface OutbreakEvent {
  id: string;
  title: string;
  description: string;
  instructions: string;
  eventCategory: 'lab_alert' | 'symptom_whisper' | 'security_quarantine' | 'power_grid';
  countdownSeconds?: number;
}

export const FICTIONAL_CURES: FictionalCure[] = [
  {
    id: 'cure-alpha',
    name: 'Serum Alpha',
    code: 'SA-101',
    color: 'emerald',
    description: 'A bioluminescent peptide synthesized from arctic micro-flora. Targets deep neurological receptors.',
    symptoms: {
      primaryPhysical: 'Subtly rubbing or massaging your left thumb or palm every 1-2 minutes.',
      speechPattern: 'Clearing your throat softly right before answering any direct question.',
      behavioralTrigger: 'Avoiding direct eye contact whenever someone mentions a specific number or time.',
      summary: 'Left palm rub + throat clearing before answering + breaking eye contact during number talk.',
    },
  },
  {
    id: 'cure-nova',
    name: 'Compound Nova',
    code: 'CN-204',
    color: 'cyan',
    description: 'An ionized crystalline stabilizer designed to inhibit cellular mutation rates.',
    symptoms: {
      primaryPhysical: 'Tapping index finger twice on the table, leg, or armrest before speaking.',
      speechPattern: 'Repeating the last word of your sentence once in a quiet whisper.',
      behavioralTrigger: 'Subtly adjusting your collar, neckline, or necklace whenever another player laughs.',
      summary: 'Double finger tap before speaking + echoing last word softly + adjusting collar when others laugh.',
    },
  },
  {
    id: 'cure-x7',
    name: 'Antidote X7',
    code: 'AX-707',
    color: 'amber',
    description: 'Heavy molecular enzyme compound tailored to neutralize viral synthetic strands.',
    symptoms: {
      primaryPhysical: 'Gently rolling your shoulders backward or stretching neck side-to-side.',
      speechPattern: 'Starting your answers with a noticeable 2-second pause while looking upward.',
      behavioralTrigger: 'Crossing both arms tightly whenever a player asks you about your health or thoughts.',
      summary: 'Neck/shoulder roll + 2-second thinking pause before speaking + crossed arms when questioned.',
    },
  },
  {
    id: 'cure-echo',
    name: 'Formula Echo',
    code: 'FE-330',
    color: 'violet',
    description: 'Resonance-based nano-emulsion designed to restore hormonal equilibrium.',
    symptoms: {
      primaryPhysical: 'Briefly touching or scratching your chin with your right knuckle.',
      speechPattern: 'Frequently using the phrase "in fact" or "as you know" in ordinary conversation.',
      behavioralTrigger: 'Shifting your sitting posture or sitting up straight whenever the Doctor speaks.',
      summary: 'Knuckle chin touch + saying "in fact/as you know" + posture adjustment when Doctor speaks.',
    },
  },
  {
    id: 'cure-orion',
    name: 'Serum Orion',
    code: 'SO-412',
    color: 'sky',
    description: 'Starlight-derived synthetic immunoglobin that blocks neural synapse decay.',
    symptoms: {
      primaryPhysical: 'Rapidly blinking three times in succession when beginning a sentence.',
      speechPattern: 'Speaking at a noticeably slower, deliberate cadence with measured syllables.',
      behavioralTrigger: 'Glancing at an imaginary wristwatch or phone clock whenever someone hesitates.',
      summary: 'Triple rapid blink + slow deliberate cadence + checking time when others hesitate.',
    },
  },
  {
    id: 'cure-delta',
    name: 'Compound Delta',
    code: 'CD-529',
    color: 'rose',
    description: 'High-density lipid suspension designed for rapid bloodstream barrier traversal.',
    symptoms: {
      primaryPhysical: 'Subtly tucking hair behind ear or smoothing eyebrows with index finger.',
      speechPattern: 'Asking a clarifying question back before giving your actual answer (e.g., "You mean me?").',
      behavioralTrigger: 'Taking a slow, audible deep breath through the nose before responding.',
      summary: 'Eyebrow smoothing/hair tuck + clarifying question before replying + slow nasal breath.',
    },
  },
  {
    id: 'cure-vortex',
    name: 'Formula Vortex',
    code: 'FV-608',
    color: 'teal',
    description: 'Centrifugal magnetic saline designed to purify infected lymphatic channels.',
    symptoms: {
      primaryPhysical: 'Subtly clasping both hands together in your lap or in front of your chest.',
      speechPattern: 'Using hand gestures shaped like spinning circles or spirals while talking.',
      behavioralTrigger: 'Immediately smiling or nodding whenever someone mentions the word "cure" or "doctor".',
      summary: 'Clasped hands + circular hand gestures + smiling whenever "cure/doctor" is mentioned.',
    },
  },
  {
    id: 'cure-sigma',
    name: 'Antidote Sigma',
    code: 'AS-881',
    color: 'indigo',
    description: 'Catalytic alkaline mixture engineered to freeze cellular pathogen duplication.',
    symptoms: {
      primaryPhysical: 'Lightly rubbing or touching your left earlobe when listening to others.',
      speechPattern: 'Ending sentences with a slight rising vocal pitch as if asking an uncertain question.',
      behavioralTrigger: 'Turning your torso slightly away when someone points directly at you.',
      summary: 'Left earlobe touch + rising vocal pitch at sentence ends + angled torso away from pointers.',
    },
  },
  {
    id: 'cure-phoenix',
    name: 'Serum Phoenix',
    code: 'SP-990',
    color: 'orange',
    description: 'Thermal activation cure with high caloric peptide regeneration chains.',
    symptoms: {
      primaryPhysical: 'Fanning yourself subtly with hand or wiping forehead as if slightly warm.',
      speechPattern: 'Occasionally sighing softly with relief after finishing a sentence.',
      behavioralTrigger: 'Reaching for or holding a beverage cup/glass whenever another player finishes speaking.',
      summary: 'Hand fanning/forehead wipe + soft relieved sigh + grabbing drink when others stop talking.',
    },
  },
  {
    id: 'cure-zenith',
    name: 'Formula Zenith',
    code: 'FZ-114',
    color: 'lime',
    description: 'Bio-synthetic chlorophyll formula that stimulates natural white blood cell rushes.',
    symptoms: {
      primaryPhysical: 'Wiggling or stretching fingers of your dominant hand as if feeling pins and needles.',
      speechPattern: 'Repeating the first word of your answer twice (e.g., "Well, well...", "I, I think...").',
      behavioralTrigger: 'Briefly looking at the floor or ceiling before answering any direct question.',
      summary: 'Finger stretching + stuttering first word twice + looking at floor/ceiling before replying.',
    },
  },
  {
    id: 'cure-atlas',
    name: 'Compound Atlas',
    code: 'CA-335',
    color: 'fuchsia',
    description: 'Heavy mineral chelation formula binding to pathogen membrane proteins.',
    symptoms: {
      primaryPhysical: 'Subtly pressing knuckles against your temples or forehead when thinking.',
      speechPattern: 'Pronouncing the letter "S" with extra crisp, sharp emphasis.',
      behavioralTrigger: 'Nodding your head slowly three times whenever anyone makes an accusation.',
      summary: 'Temple knuckle press + sharp emphasized "S" sounds + triple slow nod during accusations.',
    },
  },
  {
    id: 'cure-omega',
    name: 'Antidote Omega',
    code: 'AO-999',
    color: 'red',
    description: 'Terminal barrier vaccine developed to isolate the final stages of mutation.',
    symptoms: {
      primaryPhysical: 'Tapping your foot or bouncing your knee subtly under the table.',
      speechPattern: 'Clearing your throat with a small cough and saying "Excuse me" mid-conversation.',
      behavioralTrigger: 'Leaning forward intently whenever anyone suspects someone else.',
      summary: 'Knee bounce/foot tap + small throat cough with "excuse me" + leaning forward during others\' defense.',
    },
  },
];

export const OUTBREAK_EVENTS: OutbreakEvent[] = [
  {
    id: 'obe-1',
    title: 'Lab Telemetry Glitch',
    description: 'A sudden surge in bio-sensors creates static across the medical terminal.',
    instructions: 'The Doctor may ask any one player to stand up and turn around completely once.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-2',
    title: 'Pulse Oximeter Alert',
    description: 'An imaginary bio-scanner beeps: elevated heart rates detected in the perimeter!',
    instructions: 'Every player must state what their heart rate feels like right now on a scale of 1 to 10.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-3',
    title: 'Laboratory Quarantine Drill',
    description: 'Red emergency beacons pulse. Protocol mandates a 15-second total silence period.',
    instructions: 'All players must remain completely silent for 15 seconds. Observe every twitch and blink!',
    eventCategory: 'security_quarantine',
    countdownSeconds: 15,
  },
  {
    id: 'obe-4',
    title: 'Confidential Medical Cross-Examination',
    description: 'The Chief of Medicine authorizes a rapid interrogation procedure.',
    instructions: 'The Doctor chooses two players. Both must ask each other one direct question about their symptoms.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-5',
    title: 'Thermal Imaging Flash',
    description: 'The infrared security cameras perform a thermal sweep of the room.',
    instructions: 'One Citizen player (chosen by the group) may demand that any suspect hold their hands out flat for inspection.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-6',
    title: 'Symptom Whisper Alert',
    description: 'A confidential lab whistleblower reports heightened involuntary hand or eye movements.',
    instructions: 'All players must pay special attention to physical habits when answering questions.',
    eventCategory: 'symptom_whisper',
  },
  {
    id: 'obe-7',
    title: 'Emergency Power Grid Flicker',
    description: 'The research facility power generator stutters. Emergency green lights engage.',
    instructions: 'All players must whisper their next sentence rather than speaking at normal volume.',
    eventCategory: 'power_grid',
  },
  {
    id: 'obe-8',
    title: 'Doctor\'s Second Opinion',
    description: 'A remote specialist sends an encrypted consultation packet.',
    instructions: 'The Doctor is allowed to open the Medical Reference Guide and review symptoms undisturbed for 30 seconds.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-9',
    title: 'Citizen Coalition Defense',
    description: 'Citizens form a protective cordon against potential infection spread.',
    instructions: 'Any Citizen may publicly vouch for another player they believe is 100% healthy.',
    eventCategory: 'security_quarantine',
  },
  {
    id: 'obe-10',
    title: 'Rapid Reflex Screening',
    description: 'A fictional neurological reflex hammer test is initiated.',
    instructions: 'All players must simultaneously snap their fingers or clap their hands on the count of three.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-11',
    title: 'Suspicious Beverage Sample',
    description: 'A player\'s imaginary water cup is flagged for chemical residue analysis.',
    instructions: 'The player to the right of the Doctor must declare their favorite fictional antidote color.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-12',
    title: 'Bio-Hazard Air Purifier Blast',
    description: 'HEPA filtration fans roar to life, blowing cold sterile air through the containment zone.',
    instructions: 'Everyone must act out shivering or shivering their shoulders once.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-13',
    title: 'Contagion Timeline Reconstruction',
    description: 'Investigators ask where everyone was 24 hours prior to the outbreak.',
    instructions: 'Each player must give a 5-second fictional alibi of what they were doing yesterday.',
    eventCategory: 'security_quarantine',
  },
  {
    id: 'obe-14',
    title: 'Involuntary Vocal Spasm Rumor',
    description: 'Medical archives indicate this strain occasionally triggers phrase repetition.',
    instructions: 'Listen closely to speech patterns, throat clearings, and recurring phrases.',
    eventCategory: 'symptom_whisper',
  },
  {
    id: 'obe-15',
    title: 'Emergency Syringe Preparation',
    description: 'The Doctor prepares the pneumatic injection device with sterile needle tips.',
    instructions: 'The Doctor announces which TWO cures they suspect the most so far.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-16',
    title: 'Containment Zone Air Lock Seal',
    description: 'Heavy hydraulic doors hiss shut. No one may leave until an antidote is selected.',
    instructions: 'Players must physically sit up and face the center of the table.',
    eventCategory: 'security_quarantine',
  },
  {
    id: 'obe-17',
    title: 'Sudden Memory Lapse Check',
    description: 'Pathogen disrupts short-term spatial orientation in 40% of infected subjects.',
    instructions: 'The Doctor points to any player and asks: "What color was the shirt of the person to your left?"',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-18',
    title: 'Bio-Sensor Calibration',
    description: 'Sensors recalibrate to detect abnormal breathing rhythms.',
    instructions: 'The infected player must subtly incorporate their behavioral symptom within the next 45 seconds.',
    eventCategory: 'symptom_whisper',
  },
  {
    id: 'obe-19',
    title: 'Citizen Cross-Examination',
    description: 'The Citizens take the floor to demand answers from their most suspicious neighbor.',
    instructions: 'The Citizens together pick one suspect and ask them two rapid questions in a row.',
    eventCategory: 'security_quarantine',
  },
  {
    id: 'obe-20',
    title: 'The Lost Antidote Vial',
    description: 'Rumors spread that one fictional antidote vial had a cracked seal.',
    instructions: 'The Doctor must reassure the room that all four active cures remain potent and viable.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-21',
    title: 'Neurological Pupil Dilation Check',
    description: 'The Doctor performs an imaginary penlight test into each subject\'s eyes.',
    instructions: 'The Doctor looks into two players\' eyes for 5 seconds each without breaking gaze.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-22',
    title: 'Pathogen Mutation Acceleration',
    description: 'The infection level advances by 10%! Time is slipping away from the medical staff.',
    instructions: 'Speed up discussions! Keep questions sharp and concise.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-23',
    title: 'Sterile Glove Rupture',
    description: 'A technician accidentally tears a latex glove on a glass test-tube rack.',
    instructions: 'The player who spoke most recently must mime putting on fresh sterile gloves.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-24',
    title: 'CDC Emergency Intercom Broadcast',
    description: 'Intercom crackles: "Remember citizens, symptoms are subtle, continuous, and repeatable!"',
    instructions: 'Re-evaluate past interactions. Did someone tap fingers, clear throat, or touch their ear?',
    eventCategory: 'symptom_whisper',
  },
  {
    id: 'obe-25',
    title: 'Subtle Hand Tremor Test',
    description: 'Pathogen causes micro-tremors in fingertips when holding objects.',
    instructions: 'Everyone holds their phone or a pen in one hand for 10 seconds without dropping it.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-26',
    title: 'Bio-Hazard Warning Siren Test',
    description: 'A 5-second acoustic pulse is sent to test containment speakers.',
    instructions: 'Everyone makes a low "whoop-whoop" sound effect together.',
    eventCategory: 'power_grid',
  },
  {
    id: 'obe-27',
    title: 'The False Symptom Accusation',
    description: 'Stress in the facility is peaking. Players are seeing symptoms that might not exist.',
    instructions: 'One Citizen must openly retract one past suspicion and apologize in character.',
    eventCategory: 'security_quarantine',
  },
  {
    id: 'obe-28',
    title: 'Blood Gas Analysis Printout',
    description: 'The medical printer spits out a classified carbon-copy strip of data.',
    instructions: 'The Doctor shares one physical symptom they are most confident they saw.',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-29',
    title: 'The Ticking Containment Clock',
    description: 'Automated bio-containment countdown enters the final warning stretch.',
    instructions: 'Final 60 seconds to observe subtle behavioral habits before formal accusations!',
    eventCategory: 'lab_alert',
  },
  {
    id: 'obe-30',
    title: 'Final Inoculation Protocol Engaged',
    description: 'The Doctor\'s injection rig is fully pressurized. Formulate final hypotheses now.',
    instructions: 'Citizens prepare their confidential suspect vote; Doctor prepares cure selection.',
    eventCategory: 'lab_alert',
  },
];

export type MaturityRating = 'U' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A'
export type PlanTier = 'FREE' | 'STANDARD' | 'PREMIUM'

export interface MockTitle {
  id: string
  slug: string
  title: string
  type: 'movie' | 'series'
  synopsis: string
  fullDescription: string
  releaseYear: number
  duration: string
  maturityRating: MaturityRating
  genres: string[]
  requiredPlan: PlanTier
  dominantColor: string
  backdropUrl: string
  posterUrl: string
  trailerUrl: string
  cast: string[]
  director: string
  audioTracks: string[]
  subtitles: string[]
  qualityBadge: '4K UHD' | 'HD'
  matchScore: number
  isKids: boolean
}

export interface MockRail {
  id: string
  title: string
  isTop10?: boolean
  items: MockTitle[]
}

export const MOCK_TITLES: MockTitle[] = [
  {
    id: 'title-bbb-001',
    slug: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    type: 'movie',
    synopsis:
      'A large, lovable rabbit seeks poetic justice when bullied by forest troublemakers in this iconic, beautifully animated adventure.',
    fullDescription:
      'Big Buck Bunny tells the story of a giant, gentle rabbit with a heart bigger than his ears. When three ruthless woodland bullies—Frank the flying squirrel, Rinky the red squirrel, and Gimera the chinchilla—torment the forest creatures and crush his beloved butterflies, Bunny engineers an ingenious, Rube Goldberg-style retribution that turns the forest into an unforgettable battleground.',
    releaseYear: 2024,
    duration: '1h 32m',
    maturityRating: 'U',
    genres: ['Animation', 'Comedy', 'Family', 'Adventure'],
    requiredPlan: 'FREE',
    dominantColor: '#1d3527',
    backdropUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    cast: ['Jan Morgenstern', 'Sacha Goedegebure', 'Campbell Barton'],
    director: 'Sacha Goedegebure',
    audioTracks: ['English (5.1 Dolby Atmos)', 'Hindi (Stereo)', 'Spanish'],
    subtitles: ['English [CC]', 'Hindi', 'Spanish', 'French'],
    qualityBadge: '4K UHD',
    matchScore: 98,
    isKids: true,
  },
  {
    id: 'title-tos-002',
    slug: 'tears-of-steel',
    title: 'Tears of Steel',
    type: 'movie',
    synopsis:
      'In a dystopian neo-Amsterdam, scientists and freedom fighters reenact a fateful memory to avert a robotic apocalypse.',
    fullDescription:
      'Set in a dystopian future where Amsterdam has become the epicenter of a cataclysmic robot uprising, a desperate group of scientists and cybernetic soldiers gather at the Oude Kerk. Using advanced neural projection technology, they must reenact a pivotal relationship memory between an astronaut and a cyber-enhanced warrior to prevent machine dominance.',
    releaseYear: 2025,
    duration: '1h 45m',
    maturityRating: 'U/A 13+',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk', 'Thriller'],
    requiredPlan: 'STANDARD',
    dominantColor: '#1a2238',
    backdropUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    cast: ['Derek de Lint', 'Sergio Hasselbaink', 'Rogier Schippers'],
    director: 'Ian Hubert',
    audioTracks: ['English (Dolby Atmos)', 'Dutch', 'German'],
    subtitles: ['English [CC]', 'Dutch', 'Spanish'],
    qualityBadge: '4K UHD',
    matchScore: 95,
    isKids: false,
  },
  {
    id: 'title-sin-003',
    slug: 'sintel',
    title: 'Sintel: The Dragon’s Quest',
    type: 'movie',
    synopsis:
      'A fierce lone warrior braves freezing tundras and treacherous peaks to rescue Scales, her baby dragon companion.',
    fullDescription:
      'Driven by devotion, a solitary wanderer named Sintel traverses harsh desert ruins, treacherous snowy peaks, and ancient fortresses in search of Scales, an orphaned baby dragon she nursed to health before he was captured by a fearsome beast. An emotional, visually stunning tale of sacrifice and misunderstanding.',
    releaseYear: 2024,
    duration: '1h 22m',
    maturityRating: 'U/A 13+',
    genres: ['Fantasy', 'Adventure', 'Animation', 'Drama'],
    requiredPlan: 'PREMIUM',
    dominantColor: '#341d1a',
    backdropUrl:
      'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    cast: ['Halina Reijn', 'Thom Hoffman'],
    director: 'Colin Levy',
    audioTracks: ['English (5.1)', 'Dutch', 'Hindi'],
    subtitles: ['English [CC]', 'French', 'Hindi', 'German'],
    qualityBadge: '4K UHD',
    matchScore: 99,
    isKids: false,
  },
  {
    id: 'title-cos-004',
    slug: 'cosmos-laundromat',
    title: 'Cosmos Laundromat',
    type: 'movie',
    synopsis:
      'On a lonely windswept island, a despondent sheep is granted an eccentric infinite journey through parallel dimensions.',
    fullDescription:
      'Franck, a suicidal sheep trapped on a desolate, storm-battered island, meets Victor, a mysterious salesman operating a cosmic laundromat that offers infinite alternate lives. Thrust into parallel dimensions ranging from lush tropical jungles to hyper-technological realities, Franck discovers the dizzying kaleidoscope of existence.',
    releaseYear: 2024,
    duration: '52m',
    maturityRating: 'A',
    genres: ['Sci-Fi', 'Psychological', 'Surreal', 'Dark Comedy'],
    requiredPlan: 'PREMIUM',
    dominantColor: '#2b1a32',
    backdropUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    cast: ['Pierre Bokma', 'Reinout Scholten van Aschat'],
    director: 'Mathieu Auvray',
    audioTracks: ['English (5.1)', 'French', 'Dutch'],
    subtitles: ['English [CC]', 'Spanish', 'Japanese'],
    qualityBadge: '4K UHD',
    matchScore: 91,
    isKids: false,
  },
  {
    id: 'title-spr-005',
    slug: 'spring',
    title: 'Spring: Awakening of the Grove',
    type: 'movie',
    synopsis:
      'A shepherd girl and her faithful alpha hound journey into an enchanted valley to awaken the dormant spirit of spring.',
    fullDescription:
      'High in the clouds, a young shepherd girl and her loyal canine companion venture into a mystical forest frozen in perpetual winter. Armed with ancient chimes and ancient knowledge, she must face ancient woodland titans to bring warmth, life, and the season of rebirth back to the Earth.',
    releaseYear: 2025,
    duration: '48m',
    maturityRating: 'U',
    genres: ['Animation', 'Fantasy', 'Family', 'Mythology'],
    requiredPlan: 'FREE',
    dominantColor: '#1d322b',
    backdropUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    cast: ['Thorne Miller', 'Andy Goralczyk'],
    director: 'Andy Goralczyk',
    audioTracks: ['English', 'Music & Effects (Atmos)'],
    subtitles: ['English [CC]'],
    qualityBadge: '4K UHD',
    matchScore: 96,
    isKids: true,
  },
  {
    id: 'title-chg-006',
    slug: 'charge',
    title: 'Charge: Cyber Heist',
    type: 'movie',
    synopsis:
      'An agile cybernetic operative infiltrates a subterranean mainframe station in a desperate race against energy depletion.',
    fullDescription:
      'In an underground industrial labyrinth, a rogue cyborg with dangerously low battery levels executes an audacious raid on an automated electrical charging outpost. As defense androids swarm the sector, precision reflexes and kinetic energy redirection are the only means of survival.',
    releaseYear: 2025,
    duration: '35m',
    maturityRating: 'U/A 13+',
    genres: ['Action', 'Sci-Fi', 'Cyberpunk'],
    requiredPlan: 'STANDARD',
    dominantColor: '#291c14',
    backdropUrl:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    cast: ['Hjalti Hjalmarsson', 'Francesco Siddi'],
    director: 'Hjalti Hjalmarsson',
    audioTracks: ['English (5.1)'],
    subtitles: ['English [CC]', 'Spanish'],
    qualityBadge: 'HD',
    matchScore: 89,
    isKids: false,
  },
  {
    id: 'title-eld-007',
    slug: 'elephants-dream',
    title: 'Elephants Dream: Inside the Machine',
    type: 'movie',
    synopsis:
      'Two contrasting dreamers navigate the bewildering gears, cables, and sentient corridors of an organic supercomputer.',
    fullDescription:
      'Elder guide Proog guides the inquisitive young Emo through the impossible mechanics of the Machine—an unfathomable structure that seems half-living organism, half-steampunk clockwork. When their visions of reality clash, the Machine responds with terrifying, chaotic transformations.',
    releaseYear: 2024,
    duration: '42m',
    maturityRating: 'U/A 16+',
    genres: ['Sci-Fi', 'Surreal', 'Animation', 'Mystery'],
    requiredPlan: 'PREMIUM',
    dominantColor: '#1d2232',
    backdropUrl:
      'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    cast: ['Tygo Gernandt', 'Cas Jansen'],
    director: 'Bassam Kurdali',
    audioTracks: ['English (5.1)', 'Dutch'],
    subtitles: ['English [CC]', 'French'],
    qualityBadge: 'HD',
    matchScore: 92,
    isKids: false,
  },
  {
    id: 'title-spf-008',
    slug: 'sprite-fright',
    title: 'Sprite Fright',
    type: 'movie',
    synopsis:
      'A rowdy clique of 1980s teenagers hiking in the secluded woods disturb the territorial, surprisingly lethal Sprites.',
    fullDescription:
      'In this cheeky horror-comedy homage to 1980s monster creature features, five self-absorbed teenagers venture into a pristine British nature reserve. When their littering and callous antics awaken the seemingly cute forest Sprites, mother nature fights back with hilariously gruesome ferocity.',
    releaseYear: 2025,
    duration: '50m',
    maturityRating: 'U/A 16+',
    genres: ['Horror', 'Comedy', 'Animation'],
    requiredPlan: 'STANDARD',
    dominantColor: '#241a2a',
    backdropUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    cast: ['Phil Hendrie', 'George Cockcroft', 'Laura Foley'],
    director: 'Matthew Luhn',
    audioTracks: ['English (Atmos)'],
    subtitles: ['English [CC]', 'German'],
    qualityBadge: '4K UHD',
    matchScore: 94,
    isKids: false,
  },
  {
    id: 'title-cam-009',
    slug: 'caminandes-llamigos',
    title: 'Caminandes: Llamigos',
    type: 'movie',
    synopsis:
      'Koro the Andean llama encounters an overly enthusiastic Magellanic penguin while seeking a snack in the frozen south.',
    fullDescription:
      'Koro the stubborn llama finds himself far south in the icy Patagonian landscape. While trying to reach a tantalizing red berry bush, he crosses paths with a hyperactive little penguin who insists on turning survival into an extreme winter sporting event.',
    releaseYear: 2024,
    duration: '28m',
    maturityRating: 'U',
    genres: ['Animation', 'Comedy', 'Family'],
    requiredPlan: 'FREE',
    dominantColor: '#1a2734',
    backdropUrl:
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    cast: ['Pablo Vazquez'],
    director: 'Pablo Vazquez',
    audioTracks: ['Music & Effects'],
    subtitles: ['English [CC]'],
    qualityBadge: 'HD',
    matchScore: 97,
    isKids: true,
  },
  {
    id: 'title-her-010',
    slug: 'hero-the-chronicles',
    title: 'Hero: The Chronicles',
    type: 'series',
    synopsis:
      'An ancient guardian armed with a mystical grease pencil defends the last ink sanctuary from relentless digital decay.',
    fullDescription:
      'In an ethereal world drawn entirely with liquid light and brushstrokes, the last ink guardian awakens when a mysterious chromatic shadow begins erasing reality. Across five action-packed episodes, he must master both traditional geometry and modern kinetic energy to preserve his world.',
    releaseYear: 2025,
    duration: '1 Season (6 Episodes)',
    maturityRating: 'U/A 7+',
    genres: ['Action', 'Fantasy', 'Animation', 'Adventure'],
    requiredPlan: 'STANDARD',
    dominantColor: '#1d1f34',
    backdropUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
    posterUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    cast: ['Daniel Martinez Lara', 'Rafa Cano Mendez'],
    director: 'Daniel Martinez Lara',
    audioTracks: ['English (5.1)', 'Spanish'],
    subtitles: ['English [CC]', 'Spanish', 'Portuguese'],
    qualityBadge: '4K UHD',
    matchScore: 93,
    isKids: true,
  },
]

export const FEATURED_BILLBOARD = MOCK_TITLES[0] // Big Buck Bunny

export const MOCK_RAILS: MockRail[] = [
  {
    id: 'rail-trending-top10',
    title: 'Top 10 in India Today',
    isTop10: true,
    items: [
      MOCK_TITLES[0], // BBB
      MOCK_TITLES[1], // Tears of Steel
      MOCK_TITLES[2], // Sintel
      MOCK_TITLES[3], // Cosmos Laundromat
      MOCK_TITLES[4], // Spring
      MOCK_TITLES[5], // Charge
      MOCK_TITLES[6], // Elephants Dream
      MOCK_TITLES[7], // Sprite Fright
      MOCK_TITLES[8], // Caminandes
      MOCK_TITLES[9], // Hero
    ],
  },
  {
    id: 'rail-new-releases',
    title: 'New & Trending on StreamForge',
    isTop10: false,
    items: [
      MOCK_TITLES[1],
      MOCK_TITLES[4],
      MOCK_TITLES[7],
      MOCK_TITLES[5],
      MOCK_TITLES[9],
      MOCK_TITLES[0],
    ],
  },
  {
    id: 'rail-sci-fi-action',
    title: 'Sci-Fi & Cyberpunk Sagas',
    isTop10: false,
    items: [MOCK_TITLES[1], MOCK_TITLES[5], MOCK_TITLES[3], MOCK_TITLES[6], MOCK_TITLES[2]],
  },
  {
    id: 'rail-family-animation',
    title: 'Animation & Family Adventures',
    isTop10: false,
    items: [MOCK_TITLES[0], MOCK_TITLES[4], MOCK_TITLES[8], MOCK_TITLES[9], MOCK_TITLES[2]],
  },
]

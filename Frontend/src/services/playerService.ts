import type { Player } from '../types';

const MOCK_PLAYERS: Player[] = [
  { id: 1, name: "عبدالرحمن الغامدي", position: "وسط", age: 22, country: "السعودية", foot: "اليمنى", club: "الاتفاق", height: "178 سم", overall: 82, aiScore: 89, value: "€2.5M" },
  { id: 2, name: "محمد القحطاني", position: "مهاجم", age: 20, country: "السعودية", foot: "اليسرى", club: "الهلال", height: "175 سم", overall: 85, aiScore: 92, value: "€4.0M" },
  { id: 3, name: "أحمد الرشيدي", position: "مدافع", age: 12, country: "مصر", foot: "اليمنى", club: "الأهلي (براعم)", height: "150 سم", overall: 70, aiScore: 85, value: "€50K" },
  { id: 4, name: "رياض محرز", position: "جناح", age: 33, country: "الجزائر", foot: "اليسرى", club: "الأهلي السعودي", height: "179 سم", overall: 86, aiScore: 89, value: "€12M" },
];

export async function fetchPlayers(): Promise<Player[]> {
  return Promise.resolve(MOCK_PLAYERS);
}

export async function fetchPlayerById(id: number): Promise<Player | undefined> {
  return Promise.resolve(MOCK_PLAYERS.find(p => p.id === id));
}

export async function createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
  const newPlayer: Player = { ...player, id: Date.now() };
  return Promise.resolve(newPlayer);
}

export async function searchPlayers(query: string): Promise<Player[]> {
  const q = query.toLowerCase();
  const results = MOCK_PLAYERS.filter(p =>
    p.name.includes(q) ||
    p.position.toLowerCase().includes(q) ||
    p.country.includes(q) ||
    p.club.includes(q)
  );
  return Promise.resolve(results);
}

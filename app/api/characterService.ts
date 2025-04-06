// Character Type Definitions
export interface Character {
    id?: string;
    name: string;
    race: string;
    subrace: string | null;
    class: string;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    gold?: number;
}

// Use our proxy API routes to avoid CORS issues
const API_URL = '/api/proxy';

// API Service for Character Management
export const characterService = {
    // Get all characters
    async getCharacters(): Promise<Character[]> {
        const response = await fetch(`${API_URL}/characters`);
        if (!response.ok) {
            throw new Error('Failed to fetch characters');
        }
        return response.json();
    },

    // Get a character by ID
    async getCharacter(id: string): Promise<Character> {
        const response = await fetch(`${API_URL}/characters/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch character');
        }
        return response.json();
    },

    // Create a new character
    async createCharacter(character: Character): Promise<Character> {
        const response = await fetch(`${API_URL}/characters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(character),
        });
        if (!response.ok) {
            throw new Error('Failed to create character');
        }
        return response.json();
    },

    // Update a character
    async updateCharacter(character: Character): Promise<Character> {
        const response = await fetch(`${API_URL}/characters/${character.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(character),
        });
        if (!response.ok) {
            throw new Error('Failed to update character');
        }
        return response.json();
    },

    // Delete a character
    async deleteCharacter(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/characters/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete character');
        }
    },

    // Initialize currency for a character
    async initializeCurrency(characterClass: string): Promise<{ gold: number }> {
        const response = await fetch(`${API_URL}/currency/init/${characterClass}`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error('Failed to initialize currency');
        }
        return response.json();
    }
};

// Data from the portrait generation script
export const raceData = {
    "Dwarf": ["Hill", "Mountain"],
    "Elf": ["High", "Wood", "Drow"],
    "Halfling": ["Lightfoot", "Stout"],
    "Human": [null],
    "Dragonborn": [null],
    "Gnome": ["Forest", "Rock", "Deep"],
    "Half-Elf": [null],
    "Half-Orc": [null],
    "Tiefling": [null],
};

export const classData = [
    "Cleric", "Fighter", "Rogue", "Wizard", "Barbarian", "Bard",
    "Druid", "Monk", "Paladin", "Ranger", "Sorcerer", "Warlock"
];

// Helper function to generate a random character
export function getRandomCharacter(): Omit<Character, 'id'> {
    // Random name generation
    const names = [
        "Tordek", "Mialee", "Jozan", "Lidda", "Gimble", "Eberk", "Krusk", "Soveliss",
        "Ember", "Vadania", "Regdar", "Naull", "Devis", "Hennet", "Kerwyn", "Nebin",
        "Tana", "Ghesh", "Darrak", "Kyri", "Valros", "Elise", "Baern", "Mika"
    ];

    // Get random race and class
    const races = Object.keys(raceData);
    const randomRace = races[Math.floor(Math.random() * races.length)];
    const possibleSubraces = raceData[randomRace as keyof typeof raceData];
    const randomSubrace = possibleSubraces[Math.floor(Math.random() * possibleSubraces.length)];
    const randomClass = classData[Math.floor(Math.random() * classData.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];

    // Generate random attributes
    const rollAttribute = () => Math.floor(Math.random() * 13) + 6; // 6-18 range

    return {
        name: randomName,
        race: randomRace,
        subrace: randomSubrace,
        class: randomClass,
        strength: rollAttribute(),
        dexterity: rollAttribute(),
        constitution: rollAttribute(),
        intelligence: rollAttribute(),
        wisdom: rollAttribute(),
        charisma: rollAttribute()
    };
} 
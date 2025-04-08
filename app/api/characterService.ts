// Character Type Definitions
export interface Character {
    id?: string;
    name: string;
    race: string;
    subrace: string | null;
    class: string;
    background: string;
    alignment: string;
    hitPoints?: number;
    maxHitPoints?: number;
    abilityScores: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    };
    equipment?: {
        mainHand: number;
        offHand: number;
        shield: number;
        armor: number;
    };
    wealth: {
        gold: number;
        silver: number;
        copper: number;
    };
    armorClass: number;
    proficiencyBonus: number;
    stats: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    };
    abilityModifiers: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    };
    wallet: {
        gold: number;
        silver: number;
        copper: number;
    };
}

// Helper function to normalize character data
export function normalizeCharacter(character: Character): Character {
    // Return the character as is - we'll adapt our components to use the server structure
    return character;
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
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },

    // Get a character by ID
    async getCharacter(id: string): Promise<Character> {
        const response = await fetch(`${API_URL}/characters/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch character');
        }
        const data = await response.json();
        return data;
    },

    // Create a new character
    async createCharacter(character: Omit<Character, 'id'>): Promise<Character> {
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
        // Use the character format directly
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

        try {
            const data = await response.json();
            return data;
        } catch (error) {
            // If the response is not JSON, return the original character
            console.log(error);
            return character;
        }
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
    async initializeCurrency(characterId: string): Promise<{ gold: number }> {
        console.log(`Initializing currency for character ID: ${characterId}...`);
        const response = await fetch(`${API_URL}/characters/${characterId}/currency/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to initialize currency: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
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
        background: 'Unknown',
        alignment: 'True Neutral',
        hitPoints: 10,
        maxHitPoints: 10,
        abilityScores: {
            strength: rollAttribute(),
            dexterity: rollAttribute(),
            constitution: rollAttribute(),
            intelligence: rollAttribute(),
            wisdom: rollAttribute(),
            charisma: rollAttribute()
        },
        equipment: {
            mainHand: 0,
            offHand: 0,
            shield: 0,
            armor: 0
        },
        wealth: {
            gold: 0,
            silver: 0,
            copper: 0
        },
        armorClass: 10,
        proficiencyBonus: 2
    };
} 
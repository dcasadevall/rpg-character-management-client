import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:5266/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: { class: string } }
) {
    const characterClass = params.class;
    const url = `${API_BASE_URL}/currency/init/${characterClass}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // If the API returns an error, simulate a default gold amount based on class
            // This is a fallback in case the API endpoint is not implemented yet
            const defaultGold = getDefaultGoldForClass(characterClass);
            console.warn(`Currency API failed, using default gold amount for ${characterClass}: ${defaultGold}`);
            return NextResponse.json({ gold: defaultGold });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error proxying currency init request for ${characterClass}:`, error);

        // Provide fallback values if the API is not available
        const defaultGold = getDefaultGoldForClass(characterClass);
        console.warn(`Currency API unavailable, using default gold amount for ${characterClass}: ${defaultGold}`);
        return NextResponse.json({ gold: defaultGold });
    }
}

// Fallback function to provide default gold by class if API is unavailable
function getDefaultGoldForClass(characterClass: string): number {
    // Standard D&D 5e starting gold by class
    const goldByClass: Record<string, number> = {
        'Barbarian': 50,    // 2d4 × 10
        'Bard': 125,        // 5d4 × 10
        'Cleric': 125,      // 5d4 × 10
        'Druid': 50,        // 2d4 × 10
        'Fighter': 150,     // 5d4 × 10
        'Monk': 25,         // 5d4
        'Paladin': 150,     // 5d4 × 10
        'Ranger': 125,      // 5d4 × 10
        'Rogue': 100,       // 4d4 × 10
        'Sorcerer': 75,     // 3d4 × 10
        'Warlock': 100,     // 4d4 × 10
        'Wizard': 100,      // 4d4 × 10
    };

    return goldByClass[characterClass] || 100; // Default to 100 gold if class not found
} 
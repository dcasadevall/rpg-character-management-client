'use client';

import { useState } from 'react';
import { characterService, getRandomCharacter, raceData, classData, Character } from '../api/characterService';
import { useRouter } from 'next/navigation';

// Define a type for the character creation form (without attributes)
interface CharacterBasicInfo {
    name: string;
    race: string;
    subrace: string | null;
    class: string;
}

export default function CreateCharacter() {
    const router = useRouter();
    const [character, setCharacter] = useState<CharacterBasicInfo>(() => {
        const randomChar = getRandomCharacter();
        // Extract only the basic info properties we need for the form
        const { name, race, subrace, class: className } = randomChar;
        return { name, race, subrace, class: className };
    });
    const [isLoading, setIsLoading] = useState(false);

    // Get image path for character portrait
    const getImagePath = () => {
        const { race, subrace, class: characterClass } = character;
        return subrace
            ? `/character-creation/${race}-${subrace}-${characterClass}.png`
            : `/character-creation/${race}-${characterClass}.png`;
    };

    // Roll for a new random character without attributes
    const rollNewCharacter = () => {
        const randomChar = getRandomCharacter();
        // Extract only the basic info properties we need for the form
        const { name, race, subrace, class: className } = randomChar;
        setCharacter({ name, race, subrace, class: className });
    };

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Special handling for race changes to reset subrace appropriately
        if (name === 'race') {
            const newRace = value;
            const possibleSubraces = raceData[newRace as keyof typeof raceData] || [];
            setCharacter({
                ...character,
                race: newRace,
                subrace: possibleSubraces.length > 0 ? possibleSubraces[0] : null
            });
        } else {
            setCharacter({
                ...character,
                [name]: value
            });
        }
    };

    // Handle form submission - create character and redirect to currency roll
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Generate random attributes for the character
            const rollAttribute = () => Math.floor(Math.random() * 13) + 6; // 6-18 range

            // Complete character data with correct stats format
            const completeCharacter: Character = {
                ...character,
                hitPoints: 10,
                maxHitPoints: 10,
                stats: {
                    Strength: rollAttribute(),
                    Dexterity: rollAttribute(),
                    Constitution: rollAttribute(),
                    Intelligence: rollAttribute(),
                    Wisdom: rollAttribute(),
                    Charisma: rollAttribute()
                },
                equipment: {
                    mainHand: 0,
                    offHand: 0,
                    shield: 0,
                    armor: 0
                },
                currencies: {}
            };

            // Create the character
            const createdCharacter = await characterService.createCharacter(completeCharacter);

            if (createdCharacter.id) {
                // Redirect to finalize page for currency rolling
                router.push(`/finalize/${createdCharacter.id}`);
            } else {
                throw new Error('Character created but no ID returned');
            }
        } catch (error) {
            console.error('Failed to create character:', error);
            alert('Failed to create character. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">Create Your Character</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Character Portrait */}
                <div className="flex flex-col items-center">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg mb-4">
                        <img
                            src={getImagePath()}
                            alt={`${character.race} ${character.class} character portrait`}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <button
                        onClick={rollNewCharacter}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-800"
                        type="button"
                    >
                        Roll Random Character
                    </button>
                </div>

                {/* Character Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={character.name}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="race" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Race</label>
                            <select
                                id="race"
                                name="race"
                                value={character.race}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
                                required
                            >
                                {Object.keys(raceData).map(race => (
                                    <option key={race} value={race} className="dark:bg-gray-700">{race}</option>
                                ))}
                            </select>
                        </div>

                        {/* Show subrace dropdown only if the race has subraces */}
                        {raceData[character.race as keyof typeof raceData]?.some(subrace => subrace !== null) && (
                            <div>
                                <label htmlFor="subrace" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subrace</label>
                                <select
                                    id="subrace"
                                    name="subrace"
                                    value={character.subrace || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
                                >
                                    {raceData[character.race as keyof typeof raceData].map(subrace => (
                                        <option key={subrace || 'none'} value={subrace || ''} className="dark:bg-gray-700">{subrace || 'None'}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                            <select
                                id="class"
                                name="class"
                                value={character.class}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
                                required
                            >
                                {classData.map(characterClass => (
                                    <option key={characterClass} value={characterClass} className="dark:bg-gray-700">{characterClass}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors dark:bg-green-700 dark:hover:bg-green-800 dark:disabled:bg-gray-600"
                        >
                            {isLoading ? 'Creating Character...' : 'Create Character'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 
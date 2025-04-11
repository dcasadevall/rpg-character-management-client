'use client';

import { useState, useEffect } from 'react';
import { characterService, Character } from '../api/characterService';
import Link from 'next/link';
import Image from 'next/image';

export default function ViewCharacters() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load characters on component mount
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const data = await characterService.getCharacters();
                setCharacters(data);
                setLoading(false);
            } catch (fetchError) {
                setError('Failed to fetch characters');
                setLoading(false);
                console.error('Error fetching characters:', fetchError);
            }
        };

        fetchCharacters();
    }, []);

    // Handle character deletion
    const handleDelete = async (characterId: string) => {
        if (!window.confirm('Are you sure you want to delete this character?')) {
            return;
        }

        try {
            await characterService.deleteCharacter(characterId);
            setCharacters(characters.filter(char => char.id !== characterId));
        } catch (err) {
            console.error('Failed to delete character:', err);
            alert('Failed to delete character. Please try again later.');
        }
    };

    // Get image path for character portrait
    const getImagePath = (character: Character) => {
        // Special handling for hyphenated races
        const race = character.race.includes('-')
            ? character.race.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('-')
            : character.race.charAt(0).toUpperCase() + character.race.slice(1).toLowerCase();

        const characterClass = character.class.charAt(0).toUpperCase() + character.class.slice(1).toLowerCase();

        return character.subrace
            ? `/character-creation/${race}-${character.subrace.charAt(0).toUpperCase() + character.subrace.slice(1).toLowerCase()}-${characterClass}.png`
            : `/character-creation/${race}-${characterClass}.png`;
    };

    // Helper function to get a character's stat value
    const getStatValue = (character: Character, statName: string): number => {
        if (character.abilityScores && character.abilityScores[statName as keyof typeof character.abilityScores] !== undefined) {
            return character.abilityScores[statName as keyof typeof character.abilityScores];
        }
        return 0;
    };

    // Helper function to get a character's currency value
    const getCurrencyValue = (character: Character, currencyType: string): number => {
        if (!character) return 0;

        // Check if we have wealth object with the currency property
        if (character.wealth && typeof character.wealth === 'object') {
            // Check with lowercase currencyType as a key (e.g., 'gold')
            const lowerCaseKey = currencyType.toLowerCase() as keyof typeof character.wealth;
            if (lowerCaseKey in character.wealth && typeof character.wealth[lowerCaseKey] === 'number') {
                return character.wealth[lowerCaseKey];
            }

            // Check with capitalized currencyType as a key (e.g., 'Gold')
            const capitalizedKey = currencyType.charAt(0).toUpperCase() + currencyType.slice(1).toLowerCase() as keyof typeof character.wealth;
            if (capitalizedKey in character.wealth && typeof character.wealth[capitalizedKey] === 'number') {
                return character.wealth[capitalizedKey];
            }
        }

        // If no currency found, return 0
        return 0;
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
                    <p className="mt-4 text-indigo-700">Loading characters...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center text-red-600">
                    <p className="text-2xl font-bold mb-4">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No characters state
    if (characters.length === 0) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Your Characters</h1>
                    <Link
                        href="/create"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                        Create New Character
                    </Link>
                </div>
                <div className="text-center py-16">
                    <p className="text-xl text-gray-600 mb-6">You don&apos;t have any characters yet</p>
                    <Link
                        href="/create"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg"
                    >
                        Create Your First Character
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 dark:bg-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold dark:text-white">Your Characters</h1>
                <Link
                    href="/create"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                    Create New Character
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map(character => (
                    <div
                        key={character.id}
                        className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow dark:border-gray-700 dark:bg-gray-800"
                    >
                        <Link href={`/character/${character.id}`} className="block">
                            <div className="relative aspect-square">
                                <Image
                                    src={getImagePath(character)}
                                    alt={`${character.race} ${character.class}`}
                                    className="object-cover"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>

                            <div className="p-4 dark:text-gray-200">
                                <h2 className="text-xl font-bold mb-2 dark:text-white">{character.name}</h2>
                                <p className="text-gray-700 mb-3 dark:text-gray-300">
                                    {character.race} {character.subrace ? `(${character.subrace})` : ''} {character.class}
                                </p>

                                {/* Enhanced attributes display */}
                                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                    <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Attributes:</p>
                                    <div className="grid grid-cols-3 gap-y-2 text-sm">
                                        <div className="flex items-center">
                                            <span className="font-semibold w-9 dark:text-gray-300">STR:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getStatValue(character, 'Strength')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold w-9 dark:text-gray-300">DEX:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getStatValue(character, 'Dexterity')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold w-9 dark:text-gray-300">CON:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getStatValue(character, 'Constitution')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold w-9 dark:text-gray-300">INT:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getStatValue(character, 'Intelligence')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold w-9 dark:text-gray-300">WIS:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getStatValue(character, 'Wisdom')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold w-9 dark:text-gray-300">CHA:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getStatValue(character, 'Charisma')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Combat Stats */}
                                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                    <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Combat Stats:</p>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="flex items-center">
                                            <span className="font-semibold w-24 dark:text-gray-300">Armor Class:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{character.armorClass || 10}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold w-24 dark:text-gray-300">Proficiency:</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">+{character.proficiencyBonus || 2}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Currency display */}
                                {(getCurrencyValue(character, 'gold') > 0 || getCurrencyValue(character, 'silver') > 0 || getCurrencyValue(character, 'copper') > 0) && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                        <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Currency:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {getCurrencyValue(character, 'gold') > 0 && (
                                                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center dark:bg-yellow-900 dark:text-yellow-200">
                                                    <span className="text-yellow-600 font-bold mr-1 dark:text-yellow-400">⦿</span>
                                                    {getCurrencyValue(character, 'gold')} gold
                                                </div>
                                            )}

                                            {getCurrencyValue(character, 'silver') > 0 && (
                                                <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center dark:bg-gray-700 dark:text-gray-200">
                                                    <span className="text-gray-500 font-bold mr-1 dark:text-gray-400">⦿</span>
                                                    {getCurrencyValue(character, 'silver')} silver
                                                </div>
                                            )}

                                            {getCurrencyValue(character, 'copper') > 0 && (
                                                <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs flex items-center dark:bg-amber-900 dark:text-amber-200">
                                                    <span className="text-amber-600 font-bold mr-1 dark:text-amber-400">⦿</span>
                                                    {getCurrencyValue(character, 'copper')} copper
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>

                        <div className="px-4 pb-4 flex justify-end items-center">
                            <button
                                onClick={() => handleDelete(character.id!)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 
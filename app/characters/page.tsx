'use client';

import { useState, useEffect } from 'react';
import { characterService, Character, normalizeCharacter } from '../api/characterService';
import Link from 'next/link';

// Extended interface to accommodate both direct properties and nested properties
interface ExtendedCharacter extends Character {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
    gold?: number;
}

export default function ViewCharacters() {
    const [characters, setCharacters] = useState<ExtendedCharacter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get image path for character portrait
    const getImagePath = (character: ExtendedCharacter) => {
        const race = character.race.toLowerCase();
        const characterClass = character.class.toLowerCase();

        return character.subrace
            ? `/character-creation/${race}-${character.subrace.toLowerCase()}-${characterClass}.png`
            : `/character-creation/${race}-${characterClass}.png`;
    };

    // Helper function to get attribute value from either direct property or stats object
    const getAttributeValue = (character: ExtendedCharacter, attributeName: string): number => {
        if (character.stats && attributeName in character.stats) {
            return character.stats[attributeName as keyof typeof character.stats] as number;
        }
        return character[attributeName as keyof ExtendedCharacter] as number || 0;
    };

    // Helper function to get gold value from either direct property or currencies object
    const getGoldValue = (character: ExtendedCharacter): number | undefined => {
        if (character.currencies && character.currencies.gold !== undefined) {
            return character.currencies.gold;
        }
        return character.gold;
    };

    // Load characters on component mount
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const data = await characterService.getCharacters();
                setCharacters(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch characters:', err);
                setError('Failed to load characters. Please try again later.');
            } finally {
                setLoading(false);
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
            alert('Failed to delete character. Please try again.');
        }
    };

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
                    <p className="text-xl text-gray-600 mb-6">You don't have any characters yet</p>
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
                        <div className="relative aspect-square">
                            <img
                                src={getImagePath(character)}
                                alt={`${character.race} ${character.class}`}
                                className="w-full h-full object-cover"
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
                                        <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getAttributeValue(character, 'strength')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold w-9 dark:text-gray-300">DEX:</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getAttributeValue(character, 'dexterity')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold w-9 dark:text-gray-300">CON:</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getAttributeValue(character, 'constitution')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold w-9 dark:text-gray-300">INT:</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getAttributeValue(character, 'intelligence')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold w-9 dark:text-gray-300">WIS:</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getAttributeValue(character, 'wisdom')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold w-9 dark:text-gray-300">CHA:</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-200">{getAttributeValue(character, 'charisma')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Gold display */}
                            {(getGoldValue(character) !== undefined) && (
                                <div className="mt-3 flex items-center">
                                    <span className="text-yellow-600 font-bold mr-1 dark:text-yellow-500">⦿</span>
                                    <span className="text-sm dark:text-gray-300">{getGoldValue(character)} gold pieces</span>
                                </div>
                            )}

                            <div className="mt-4 flex justify-between items-center">
                                <Link
                                    href={`/character/${character.id}`}
                                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => handleDelete(character.id!)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 
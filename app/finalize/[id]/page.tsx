'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { characterService, Character } from '../../api/characterService';
import Link from 'next/link';

export default function FinalizeCurrency() {
    const router = useRouter();
    const params = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [gold, setGold] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [rollingGold, setRollingGold] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacter = async () => {
            if (!params.id) {
                setError('No character ID provided');
                setLoading(false);
                return;
            }

            try {
                const data = await characterService.getCharacter(params.id as string);
                setCharacter(data);
                setError(null);

                // Automatically start rolling for gold
                await rollForGold(data);
            } catch (err) {
                console.error('Failed to fetch character:', err);
                setError('Failed to load character. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, [params.id]);

    // Get image path for character portrait
    const getImagePath = () => {
        if (!character) return '';

        const race = character.race.toLowerCase();
        const characterClass = character.class.toLowerCase();

        return character.subrace
            ? `/character-creation/${race}-${character.subrace.toLowerCase()}-${characterClass}.png`
            : `/character-creation/${race}-${characterClass}.png`;
    };

    // Roll for gold
    const rollForGold = async (characterData: Character) => {
        setRollingGold(true);

        try {
            // Simulate dice rolling with a delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Initialize currency for the character
            const currencyData = await characterService.initializeCurrency(characterData.class);

            // Update character with gold
            const updatedCharacter = {
                ...characterData,
                currencies: {
                    ...characterData.currencies,
                    gold: currencyData.gold
                }
            };

            try {
                const updateResponse = await characterService.updateCharacter(updatedCharacter);

                // Handle different possible response formats
                if (typeof updateResponse === 'object') {
                    if (updateResponse.id) {
                        // If we got back a character object
                        setCharacter(updateResponse);
                        setGold(updateResponse.currencies?.gold || currencyData.gold);
                    } else {
                        // If we got back a success response
                        setGold(currencyData.gold);
                        setCharacter(updatedCharacter);
                    }
                } else {
                    // Fallback
                    setGold(currencyData.gold);
                    setCharacter(updatedCharacter);
                }
            } catch (updateError) {
                console.error('Character updated with gold but failed to refresh data:', updateError);
                // Still update the UI even if the refresh fails
                setGold(currencyData.gold);
                setCharacter(updatedCharacter);
            }
        } catch (err) {
            console.error('Failed to roll for gold:', err);
            setError('Failed to determine starting gold. Please try again.');
        } finally {
            setRollingGold(false);
        }
    };

    const handleManageCharacter = () => {
        if (character?.id) {
            router.push(`/character/${character.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 dark:bg-gray-900 dark:text-white">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:border-red-800 dark:text-red-200">
                    {error}
                </div>
                <Link
                    href="/characters"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                    View All Characters
                </Link>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="text-center py-10 dark:bg-gray-900 dark:text-white">
                <p className="mb-4">Character not found</p>
                <Link
                    href="/create"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                    Create a Character
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Your Character is Created!</h1>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-800">
                <div className="md:flex">
                    {/* Character Portrait */}
                    <div className="md:w-1/3">
                        <div className="relative aspect-square">
                            <img
                                src={getImagePath()}
                                alt={`${character.race} ${character.class} character portrait`}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Character Details */}
                    <div className="md:w-2/3 p-6 dark:text-gray-200">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2 dark:text-white">{character.name}</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                {character.race} {character.subrace ? `(${character.subrace})` : ''} {character.class}
                            </p>
                        </div>

                        {/* Gold Section */}
                        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                            <h3 className="text-lg font-medium mb-4 border-b pb-2 dark:border-gray-600 dark:text-gray-200">Starting Gold</h3>

                            {rollingGold ? (
                                <div className="flex flex-col items-center py-4">
                                    <div className="animate-bounce text-3xl mb-2">🎲</div>
                                    <p className="text-lg font-medium dark:text-gray-200">Rolling for gold...</p>
                                    <p className="text-sm text-gray-600 mt-2 dark:text-gray-400">Determining your character's starting wealth</p>
                                </div>
                            ) : gold !== null ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full flex items-center text-xl dark:bg-yellow-900 dark:text-yellow-200">
                                        <span className="text-yellow-600 font-bold mr-2 dark:text-yellow-400">⦿</span>
                                        <span className="font-bold">{gold}</span> gold pieces
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-4">
                                    <p className="text-gray-500 dark:text-gray-400">Gold amount could not be determined</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleManageCharacter}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-600"
                                disabled={rollingGold}
                            >
                                Manage Character
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
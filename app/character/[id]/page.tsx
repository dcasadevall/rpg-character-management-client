'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { characterService, Character } from '../../api/characterService';
import Link from 'next/link';
import Image from 'next/image';

export default function CharacterDetail() {
    const router = useRouter();
    const params = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
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
            } catch (err) {
                console.error('Failed to fetch character:', err);
                setError('Failed to load character. Please try again later.');
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

    // Helper function to get a character's stat value
    const getStatValue = (statName: string): number => {
        if (!character || !character.stats) return 0;
        return character.stats[statName as keyof typeof character.stats] || 0;
    };

    // Helper function to get a character's currency value
    const getCurrencyValue = (currencyType: string): number => {
        if (!character) return 0;

        // Check if we have currencies object with the currency property
        if (character.currencies && typeof character.currencies === 'object') {
            // Check with lowercase currencyType as a key (e.g., 'gold')
            const lowerCaseKey = currencyType.toLowerCase();
            if (lowerCaseKey in character.currencies && typeof character.currencies[lowerCaseKey] === 'number') {
                return character.currencies[lowerCaseKey];
            }

            // Check with capitalized currencyType as a key (e.g., 'Gold')
            const capitalizedKey = currencyType.charAt(0).toUpperCase() + currencyType.slice(1).toLowerCase();
            if (capitalizedKey in character.currencies && typeof character.currencies[capitalizedKey] === 'number') {
                return character.currencies[capitalizedKey];
            }
        }

        // If no currency found, return 0
        return 0;
    };

    // Helper function to get a character's gold value
    const getGoldValue = (): number => {
        if (!character) return 0;

        // Check if we have currencies object with gold property
        if (character.currencies && typeof character.currencies === 'object') {
            // Check with 'gold' as a key
            if ('gold' in character.currencies && typeof character.currencies.gold === 'number') {
                return character.currencies.gold;
            }

            // Check with 'Gold' as a key (capitalized)
            if ('Gold' in character.currencies && typeof character.currencies.Gold === 'number') {
                return character.currencies.Gold;
            }
        }

        // If no gold found, return 0
        return 0;
    };

    // Handle character deletion
    const handleDelete = async () => {
        if (!character || !character.id) return;

        if (!window.confirm('Are you sure you want to delete this character?')) {
            return;
        }

        try {
            await characterService.deleteCharacter(character.id);
            router.push('/characters');
        } catch (err) {
            console.error('Failed to delete character:', err);
            alert('Failed to delete character. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="text-center py-8 dark:bg-gray-900 dark:text-white">
                <p className="text-red-500 mb-4 dark:text-red-400">{error || 'Character not found'}</p>
                <Link
                    href="/characters"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                    Back to Characters
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 dark:bg-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold dark:text-white">{character.name}</h1>
                <div className="space-x-4">
                    <Link
                        href="/characters"
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Back to Characters
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                        Delete Character
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-800">
                <div className="md:flex">
                    {/* Character Portrait */}
                    <div className="md:w-1/3 flex items-center justify-center p-6">
                        <div className="relative w-full max-w-md aspect-square">
                            <Image
                                src={getImagePath()}
                                alt={`${character.race} ${character.class} character portrait`}
                                className="object-cover rounded-lg"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority
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

                            {/* Hit Points */}
                            {character.hitPoints !== undefined && character.maxHitPoints !== undefined && (
                                <div className="mt-2">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        HP: {character.hitPoints}/{character.maxHitPoints}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Attributes Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700 dark:text-gray-200">Attributes</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Strength:</span> {getStatValue('Strength')}
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Dexterity:</span> {getStatValue('Dexterity')}
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Constitution:</span> {getStatValue('Constitution')}
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Intelligence:</span> {getStatValue('Intelligence')}
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Wisdom:</span> {getStatValue('Wisdom')}
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Charisma:</span> {getStatValue('Charisma')}
                                </div>
                            </div>
                        </div>

                        {/* Combat Stats Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700 dark:text-gray-200">Combat Stats</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Armor Class:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                                        {character.armorClass || 10}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Proficiency:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                                        +{character.proficiencyBonus || 2}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Equipment Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700 dark:text-gray-200">Equipment</h3>

                            {/* Currencies */}
                            <div className="mb-4">
                                <h4 className="text-md font-medium mb-2 dark:text-gray-300">Currency</h4>
                                <div className="flex flex-wrap gap-2">
                                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center dark:bg-yellow-900 dark:text-yellow-200">
                                        <span className="text-yellow-600 font-bold mr-1 dark:text-yellow-400">⦿</span> {getCurrencyValue('gold')} gold
                                    </div>

                                    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center dark:bg-gray-700 dark:text-gray-200">
                                        <span className="text-gray-500 font-bold mr-1 dark:text-gray-400">⦿</span> {getCurrencyValue('silver')} silver
                                    </div>

                                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center dark:bg-amber-900 dark:text-amber-200">
                                        <span className="text-amber-600 font-bold mr-1 dark:text-amber-400">⦿</span> {getCurrencyValue('copper')} copper
                                    </div>
                                </div>
                            </div>

                            {/* Other equipment would go here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
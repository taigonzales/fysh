'use client'

import { useEffect, useState, useCallback } from 'react'

type Game = {
  id: string
  sport: string
  homeTeam: string
  awayTeam: string
  homeTeamAbbr: string
  awayTeamAbbr: string
  startTime: string
  status: 'SCHEDULED' | 'LIVE' | 'FINAL'
  homeScore: number | null
  awayScore: number | null
  _count: {
    odds: number
    props: number
  }
}

type Odds = {
  sportsbook: string
  marketType: string
  homeOdds: number
  awayOdds: number
  homeLine?: number
  awayLine?: number
  overUnder?: number
  overOdds?: number
  underOdds?: number
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedSport, setSelectedSport] = useState('NBA')
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameOdds, setGameOdds] = useState<Odds[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/games?sport=${selectedSport}`)
      const data = await res.json()
      if (data.success) {
        setGames(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch games:', error)
    }
    setLoading(false)
  }, [selectedSport])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  const fetchOdds = async (gameId: string) => {
    try {
      const res = await fetch(`/api/odds?gameId=${gameId}`)
      const data = await res.json()
      if (data.success) {
        setGameOdds(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch odds:', error)
    }
  }

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds
  }

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const handleGameClick = (gameId: string) => {
    if (selectedGame === gameId) {
      setSelectedGame(null)
      setGameOdds([])
    } else {
      setSelectedGame(gameId)
      fetchOdds(gameId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'text-green-500'
      case 'FINAL':
        return 'text-gray-500'
      default:
        return 'text-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎣 FYSH Games</h1>
          <p className="text-gray-600">Live sports betting odds and lines</p>
        </div>

        {/* Sport Filter */}
        <div className="mb-6 flex gap-2">
          {['NBA', 'NHL', 'NCAAB', 'NFL', 'MLB'].map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSport === sport
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Games List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No {selectedSport} games found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => handleGameClick(game.id)}
                  className="p-6 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-semibold ${getStatusColor(game.status)}`}>
                          {game.status}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatTime(game.startTime)}
                        </span>
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        {game.awayTeam} @ {game.homeTeam}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {game.awayTeamAbbr} @ {game.homeTeamAbbr}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {game._count.odds} odds • {game._count.props} props
                      </div>
                      <div className="mt-2">
                        <span className="text-blue-600 text-sm">
                          {selectedGame === game.id ? 'Hide odds ▲' : 'View odds ▼'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Odds Panel */}
                {selectedGame === game.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {gameOdds.length === 0 ? (
                      <p className="text-gray-500 text-center">No odds available for this game</p>
                    ) : (
                      <div className="space-y-4">
                        {['MONEYLINE', 'SPREAD', 'TOTAL'].map((marketType) => {
                          const marketOdds = gameOdds.filter((o) => o.marketType === marketType)
                          if (marketOdds.length === 0) return null

                          return (
                            <div key={marketType}>
                              <h3 className="font-semibold text-gray-900 mb-2">{marketType}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {marketOdds.map((odds, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white rounded-lg p-4 border border-gray-200"
                                  >
                                    <div className="font-medium text-gray-700 mb-2">
                                      {odds.sportsbook}
                                    </div>
                                    {marketType === 'MONEYLINE' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">{game.awayTeamAbbr}</span>
                                          <span className="font-medium">
                                            {formatOdds(odds.awayOdds)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">{game.homeTeamAbbr}</span>
                                          <span className="font-medium">
                                            {formatOdds(odds.homeOdds)}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {marketType === 'SPREAD' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            {game.awayTeamAbbr} {odds.awayLine && formatOdds(odds.awayLine)}
                                          </span>
                                          <span className="font-medium">
                                            {formatOdds(odds.awayOdds)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            {game.homeTeamAbbr} {odds.homeLine && formatOdds(odds.homeLine)}
                                          </span>
                                          <span className="font-medium">
                                            {formatOdds(odds.homeOdds)}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    {marketType === 'TOTAL' && odds.overUnder && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Over {odds.overUnder}</span>
                                          <span className="font-medium">
                                            {odds.overOdds && formatOdds(odds.overOdds)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Under {odds.overUnder}</span>
                                          <span className="font-medium">
                                            {odds.underOdds && formatOdds(odds.underOdds)}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

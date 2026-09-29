'use server'

import { requireSession } from '@/modules/auth'
import {
  addToWatchlist,
  removeFromWatchlist,
  rateTitle,
  getWatchlist,
  getWatchHistory,
} from './service'

export async function addToWatchlistAction(titleId: string) {
  const session = await requireSession()
  if (!session.profileId) {
    throw new Error('Active profile required.')
  }
  return addToWatchlist(session.profileId, titleId)
}

export async function removeFromWatchlistAction(titleId: string) {
  const session = await requireSession()
  if (!session.profileId) {
    throw new Error('Active profile required.')
  }
  return removeFromWatchlist(session.profileId, titleId)
}

export async function rateTitleAction(titleId: string, value: 'like' | 'dislike') {
  const session = await requireSession()
  if (!session.profileId) {
    throw new Error('Active profile required.')
  }
  return rateTitle(session.profileId, titleId, value)
}

export async function getWatchlistAction() {
  const session = await requireSession()
  if (!session.profileId) {
    return []
  }
  return getWatchlist(session.profileId, session)
}

export async function getWatchHistoryAction() {
  const session = await requireSession()
  if (!session.profileId) {
    return []
  }
  return getWatchHistory(session.profileId, session)
}

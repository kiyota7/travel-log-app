import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

// Trip/EntryモデルへのCRUDL用クライアント。'use client'なコンポーネントからのみ使う。
export const client = generateClient<Schema>();

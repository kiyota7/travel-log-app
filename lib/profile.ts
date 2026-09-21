import { client } from './amplify-client';

// owner文字列(`sub::sub`複合形式、またはget()で返る生のsubのみの形式)から
// Profileのidと一致するユーザーIDを取り出す。
export function extractUserId(owner: string): string {
  return owner.split('::')[0];
}

export async function getDisplayName(userId: string): Promise<string> {
  const { data } = await client.models.Profile.get({ id: userId });
  return data?.displayName ?? userId;
}

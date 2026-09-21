import { getCurrentUser } from 'aws-amplify/auth';

// Amplify DataのallowOwner()が自動付与する`owner`フィールドは、DynamoDB上では
// `${sub}::${username}` という複合形式で保存されている(実際に確認して判明)。
// list/observeQueryのfilterはこの複合形式との完全一致が必要(例: /tripsページの
// 自分の旅行への絞り込み)。
export async function getOwnerIdentity(): Promise<string> {
  const { userId, username } = await getCurrentUser();
  return `${userId}::${username}`;
}

// Profileのid・URLのユーザーID・Follow.followingId等、ユーザーを一意に表す
// 識別子として使う値(Cognitoのusername)。
export async function getUserId(): Promise<string> {
  const { username } = await getCurrentUser();
  return username;
}

// 個別レコードをget()で取得した場合、返ってくるownerフィールドは複合形式ではなく
// 生のusername(sub)部分のみになる(list系とget系で返却形式が異なることを実機で
// 確認済み)。そのため所有者判定はどちらの形式でも一致するように緩く比較する。
export function isOwnedBy(owner: string | null | undefined, userId: string): boolean {
  if (!owner) return false;
  return owner === userId || owner.startsWith(`${userId}::`);
}

// 自分以外の任意ユーザーのFollow等をownerでfilterしたい場合に使う。
// このアプリはメールアドレスでのセルフサインアップのみのため、Cognitoの
// username(=sub)は全ユーザーで一致する(sub === username)という前提に基づく。
export function ownerIdentityFor(userId: string): string {
  return `${userId}::${userId}`;
}

import { getCurrentUser } from 'aws-amplify/auth';

// Amplify DataのallowOwner()が自動付与する`owner`フィールドは
// `${sub}::${username}` という複合形式で保存される(実際にDynamoDBを確認して
// 判明)。自分の所有レコードを絞り込むfilterや所有者判定には、この形式に
// 一致する文字列が必要になる。
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

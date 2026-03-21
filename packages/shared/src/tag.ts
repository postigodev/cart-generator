export type TagScope = 'system' | 'user';
export type TagKind = 'general' | 'dietary_badge';

export type Tag = {
  id: string;
  owner_user_id?: string;
  name: string;
  slug: string;
  scope: TagScope;
  kind: TagKind;
  created_at: string;
  updated_at: string;
};

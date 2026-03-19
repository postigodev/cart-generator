export type TagScope = 'system' | 'user';

export type Tag = {
  id: string;
  owner_user_id?: string;
  name: string;
  slug: string;
  scope: TagScope;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  discord: DiscordInfo;
  profile: UserProfile;
  roles: UserRoles;
  hellowelcometocrystalfortnite: string;
};

type DiscordInfo = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isDonator: boolean;
};

type UserRoles = {
  list: string[];
};

type UserProfile = {
  athena: AthenaProfile;
  common_core: CommonCoreProfile;
  stats: UserStatistics;
};

type UserStatistics = {
  kd: string;
  wins: string;
  eliminations: string;
  matchesPlayed: string;
  hoursPlayed: string;
};

type AthenaProfile = {
  favoriteCharacterId: string;
  season: {
    level: number;
    xp: number;
    battlePass: {
      purchased: boolean;
      level: number;
      xp: number;
    };
  };
  hype: number;
};

type CommonCoreProfile = {
  vbucks: number;
};

type RawUser = {
  AccountID: string;
  UserAccount: string;
  Profile: string;
  Discord: string;
};

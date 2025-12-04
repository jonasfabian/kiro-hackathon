// Service to manage avatar assignment

export class AvatarService {
  private static readonly AVATARS = [
    'skeleton-happy.svg',
    'pumpkin-spooky.svg',
    'pumpkin-happy.svg',
    'spider-cute.svg',
    'ghost-shy.svg',
    'ghost-cute.svg',
    'vampire-cute.svg',
    'mummy-wrapped.svg',
    'bat-flying.svg',
    'candy-corn.svg',
    'witch-hat.svg',
    'cat-black.svg'
  ];

  /**
   * Assigns a random avatar to a player
   */
  public static assignRandomAvatar(): string {
    const randomIndex = Math.floor(Math.random() * this.AVATARS.length);
    return this.AVATARS[randomIndex];
  }

  /**
   * Gets all available avatars
   */
  public static getAllAvatars(): string[] {
    return [...this.AVATARS];
  }
}

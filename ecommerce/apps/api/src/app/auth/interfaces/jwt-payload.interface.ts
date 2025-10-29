export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenId: string;
}

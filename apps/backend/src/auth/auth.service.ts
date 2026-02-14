import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '../domain/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginRequestDto } from './dto/login-request.dto';

interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateAuthDto) {
    const existingUser = await this.userRepository.findOne({ email: dto.email });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash: this.hashPassword(dto.password),
      name: dto.name,
      role: UserRole.ADMIN,
    });

    const em = this.userRepository.getEntityManager();
    em.persist(user);
    await em.flush();

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginRequestDto): Promise<TokenPair> {
    const user = await this.userRepository.findOne({ email: dto.email });

    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken?: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    try {
      const refreshSecret = this.getRefreshSecret();
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.userRepository.findOne({ id: payload.sub });
      if (!user) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  private issueTokens(user: User): TokenPair {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: UserRole.ADMIN,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.getAccessSecret(),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  private getAccessSecret(): string {
    return this.configService.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret');
  }

  private getRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret');
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const passwordHashBuffer = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(hash, 'hex');

    if (passwordHashBuffer.length !== storedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(passwordHashBuffer, storedHashBuffer);
  }
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users') // Tabla para el registro de usuarios
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 15 })
  telephone: string;

  @Column()
  dateOfBirth: Date;

  @Column({ unique: true })
  email: string;

  @Column({ length: 100 })
  password: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  // token values
  // The date when the token was initiated (or created)
  @Column({ type: 'timestamp', nullable: true })
  initDateToken: Date;

  // The date when the token expires
  @Column({ type: 'timestamp', nullable: true })
  expirationToken: Date;

  // The token value itself
  @Column({ length: 255, nullable: true })
  token: string;

  // JWT HS256 produces (max char: 255)
  @Column({ length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ length: 6, nullable: true })
  resetPasswordOTP?: string; // OTP code with 6 digits

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date; // Expiration for token or OTP
}

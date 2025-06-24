export interface PermissionDto {
  id: string;
  name: string;
  description: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  permissions: PermissionDto[];
  iat: number;
  exp: number;
}

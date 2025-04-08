// User interface based on API response
export interface UserRole {
   id: number;
   name: string;
   createdAt: string;
   updatedAt: string;
   deletedAt: null | string;
   isDeleted: boolean;
   __entity: string;
}

export interface UserStatus {
   id: number;
   name: string;
   createdAt: string;
   updatedAt: string;
   deletedAt: null | string;
   isDeleted: boolean;
   __entity: string;
}

export interface User {
   id: number;
   email: string;
   provider: string;
   socialId: null | string;
   firstName: string;
   lastName: string;
   role: UserRole;
   status: UserStatus;
   createdAt: string;
   updatedAt: string;
   deletedAt: null | string;
   phone: number;
}

export interface Address {
   id?: number;
   fullName: string;
   phone: string;
   province: string;
   district: string;
   ward: string;
   streetAddress: string;
   isDefault?: boolean;
   userId?: number;
}
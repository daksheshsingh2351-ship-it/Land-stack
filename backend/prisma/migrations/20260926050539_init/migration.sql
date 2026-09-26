-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'OFFICER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LandUse" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'AGRICULTURAL', 'INDUSTRIAL', 'PUBLIC_INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('VERIFIED', 'PENDING', 'DISPUTED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('INDIVIDUAL', 'JOINT', 'INSTITUTIONAL', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "OwnershipStatus" AS ENUM ('CLEAR_TITLE', 'DISPUTED', 'UNDER_VERIFICATION');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('UPDATE_ROR_DETAILS', 'BOUNDARY_VERIFICATION', 'TAX_DISPUTE_RESOLUTION', 'REGISTRATION_INFO', 'LAND_USE_VERIFICATION', 'PROPERTY_TAX_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'VERIFIED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('REQUIRES_VERIFICATION', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'SYNCING', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CITIZEN',
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" TEXT NOT NULL,
    "ulpin" TEXT NOT NULL,
    "plotNumber" TEXT NOT NULL,
    "surveyNo" TEXT,
    "gatNumber" TEXT,
    "khataNumber" TEXT,
    "area" DOUBLE PRECISION NOT NULL,
    "areaUnit" TEXT NOT NULL DEFAULT 'sqm',
    "location" TEXT NOT NULL,
    "village" TEXT,
    "taluka" TEXT,
    "district" TEXT,
    "state" TEXT,
    "landUse" "LandUse" NOT NULL DEFAULT 'RESIDENTIAL',
    "zoning" TEXT,
    "status" "ParcelStatus" NOT NULL DEFAULT 'PENDING',
    "riskStatus" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "buildingPermission" TEXT,
    "developmentRestrictions" TEXT,
    "propertyTaxStatus" TEXT,
    "outstandingAmount" TEXT,
    "encumbranceStatus" TEXT,
    "mortgage" TEXT,
    "electricity" TEXT,
    "water" TEXT,
    "roadAccess" TEXT,
    "registrationStatus" TEXT,
    "lastTransactionDate" TIMESTAMP(3),
    "lastTransactionType" TEXT,
    "registrationDocumentId" TEXT,
    "lastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ownerships" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "userId" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownershipType" "OwnershipType" NOT NULL DEFAULT 'INDIVIDUAL',
    "ownershipStatus" "OwnershipStatus" NOT NULL DEFAULT 'CLEAR_TITLE',
    "rorStatus" TEXT,
    "verificationStatus" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "acquiredDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "parcelId" TEXT,
    "ulpin" TEXT,
    "creatorId" TEXT NOT NULL,
    "officerId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_alerts" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "confidence" TEXT,
    "title" TEXT,
    "description" TEXT,
    "recordedUse" TEXT,
    "observedSignal" TEXT,
    "recommendation" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'REQUIRES_VERIFICATION',
    "createdById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connected_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "description" TEXT,
    "status" "SystemStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connected_systems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "parcels_ulpin_key" ON "parcels"("ulpin");

-- CreateIndex
CREATE INDEX "parcels_district_taluka_village_idx" ON "parcels"("district", "taluka", "village");

-- CreateIndex
CREATE INDEX "parcels_plotNumber_idx" ON "parcels"("plotNumber");

-- CreateIndex
CREATE INDEX "parcels_status_idx" ON "parcels"("status");

-- CreateIndex
CREATE INDEX "ownerships_parcelId_idx" ON "ownerships"("parcelId");

-- CreateIndex
CREATE INDEX "ownerships_userId_idx" ON "ownerships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "service_requests_requestId_key" ON "service_requests"("requestId");

-- CreateIndex
CREATE INDEX "service_requests_creatorId_idx" ON "service_requests"("creatorId");

-- CreateIndex
CREATE INDEX "service_requests_officerId_idx" ON "service_requests"("officerId");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "ai_alerts_parcelId_idx" ON "ai_alerts"("parcelId");

-- CreateIndex
CREATE INDEX "ai_alerts_status_idx" ON "ai_alerts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "connected_systems_name_key" ON "connected_systems"("name");

-- AddForeignKey
ALTER TABLE "ownerships" ADD CONSTRAINT "ownerships_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownerships" ADD CONSTRAINT "ownerships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_alerts" ADD CONSTRAINT "ai_alerts_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_alerts" ADD CONSTRAINT "ai_alerts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

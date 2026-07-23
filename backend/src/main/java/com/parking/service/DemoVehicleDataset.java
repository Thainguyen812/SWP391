package com.parking.service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.io.File;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.Graphics2D;
import java.awt.Color;
import java.awt.BasicStroke;
import java.awt.Font;
import java.awt.RenderingHints;
import java.awt.FontMetrics;

public final class DemoVehicleDataset {
    public record Profile(
            String plate,
            String model,
            String brand,
            String vehicleType,
            String fuelType,
            boolean vip,
            String color,
            String colorRgb,
            String bodyShape,
            String zoneCode,
            String imageUrl,
            String registrationDocUrl,
            String registrationPhotoUrl,
            String identityDocUrl) {
    }

    private static final String SEDAN_IMAGE = "/images/raize.png";
    private static final String SUV_IMAGE = "/images/santafe.png";
    private static final String VAN_IMAGE = "/images/transit.png";
    private static final String MINIBUS_IMAGE = "/images/granvia.png";

    private static final List<Profile> PROFILES = List.of(
            p("30H-12312", "Toyota Vios", "Toyota", "SEDAN_HATCHBACK", "GASOLINE", true, "Vang", "#F7C600"),
            p("30H-12314", "Toyota Raize", "Toyota", "SEDAN_HATCHBACK", "GASOLINE", false, "Xanh nhat", "#8BC6FF"),
            p("30G-68788.SIM", "Hyundai Accent", "Hyundai", "SEDAN_HATCHBACK", "GASOLINE", false, "Trang", "#FFFFFF"),
            p("29A-47440.SIM", "Kia Morning", "Kia", "SEDAN_HATCHBACK", "GASOLINE", false, "Xanh bac", "#D5E7FF"),
            p("51H-61444.SIM", "Mazda 3", "Mazda", "SEDAN_HATCHBACK", "GASOLINE", false, "Den", "#1F2937"),
            p("65A-56432", "VinFast VF e34", "VinFast", "SEDAN_HATCHBACK", "ELECTRIC", false, "Trang", "#FFFFFF"),
            p("30E-44840.SIM", "VinFast VF 5", "VinFast", "SEDAN_HATCHBACK", "ELECTRIC", false, "Xanh", "#0EA5E9"),
            p("51F-35072.SIM", "Tesla Model 3", "Tesla", "SEDAN_HATCHBACK", "ELECTRIC", false, "Do", "#EF4444"),

            p("65A-09231", "Toyota Camry", "Toyota", "SUV_CUV_MPV", "GASOLINE", true, "Trang", "#FFFFFF"),
            p("65H-98765", "Ford Everest", "Ford", "SUV_CUV_MPV", "GASOLINE", false, "Trang", "#FFFFFF"),
            p("51A-28454.SIM", "Hyundai Santa Fe", "Hyundai", "SUV_CUV_MPV", "GASOLINE", false, "Trang", "#FFFFFF"),
            p("51K-87908.SIM", "Kia Sorento", "Kia", "SUV_CUV_MPV", "GASOLINE", false, "Den", "#111827"),
            p("30E-75058.SIM", "VinFast VF 9", "VinFast", "SUV_CUV_MPV", "ELECTRIC", false, "Xanh dam", "#0F172A"),
            p("59A-55555", "Honda CR-V", "Honda", "SUV_CUV_MPV", "GASOLINE", false, "Trang", "#FFFFFF"),

            p("51H-13579", "Ford Transit", "Ford", "VAN_TRUCK", "GASOLINE", true, "Trang", "#FFFFFF"),
            p("51H-14963.SIM", "Ford Transit Van", "Ford", "VAN_TRUCK", "GASOLINE", false, "Trang", "#FFFFFF"),
            p("51G-63567.SIM", "Hyundai Porter", "Hyundai", "VAN_TRUCK", "GASOLINE", false, "Bac", "#94A3B8"),
            p("29A-52992.SIM", "Kia Carnival Cargo", "Kia", "VAN_TRUCK", "GASOLINE", false, "Den", "#0F172A"),

            p("51K-29673.SIM", "Toyota Granvia", "Toyota", "MINIBUS_16", "GASOLINE", true, "Trang", "#FFFFFF"),
            p("51K-95013.SIM", "Mercedes Sprinter", "Mercedes", "MINIBUS_16", "GASOLINE", false, "Trang", "#FFFFFF"),
            p("51F-43244.SIM", "Ford Transit 16 cho", "Ford", "MINIBUS_16", "GASOLINE", false, "Trang", "#FFFFFF"),
            p("30E-31770.SIM", "VinFast Minibus EV", "VinFast", "MINIBUS_16", "ELECTRIC", true, "Xanh", "#0EA5E9"));

    private DemoVehicleDataset() {
    }

    public static List<Profile> profiles() {
        return PROFILES;
    }

    public static Optional<Profile> findByPlate(String plate) {
        String normalized = normalizePlate(plate);
        if (normalized.isBlank()) {
            return Optional.empty();
        }
        return PROFILES.stream()
                .filter(profile -> normalizePlate(profile.plate()).equals(normalized))
                .findFirst();
    }

    public static String normalizePlate(String plate) {
        return plate == null ? "" : plate.trim().toUpperCase(Locale.ROOT).replaceAll("\\s+", "");
    }

    public static String normalizeVehicleType(String value) {
        String raw = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (raw.contains("MINIBUS_16") || raw.contains("16")) {
            return "MINIBUS_16";
        }
        if (raw.contains("VAN_TRUCK") || raw.contains("LARGE_VAN_MINIBUS") || raw.contains("VAN") || raw.contains("TRUCK") || raw.contains("TAI")) {
            return "VAN_TRUCK";
        }
        if (raw.contains("SUV") || raw.contains("CUV") || raw.contains("MPV") || raw.contains("7") || raw.contains("9")) {
            return "SUV_CUV_MPV";
        }
        return "SEDAN_HATCHBACK";
    }

    public static String resolveVehicleType(String plate, String fallback) {
        return findByPlate(plate)
                .map(Profile::vehicleType)
                .orElseGet(() -> normalizeVehicleType(fallback));
    }

    public static String resolveFuelType(String plate, String fallback) {
        String resolved = findByPlate(plate).map(Profile::fuelType).orElse(fallback);
        if (resolved == null || resolved.trim().isBlank()) {
            return "GASOLINE";
        }
        return resolved.trim().toUpperCase(Locale.ROOT);
    }

    public static String resolveZoneCode(String plate, String fallbackVehicleType) {
        return findByPlate(plate).map(Profile::zoneCode).orElseGet(() -> zoneForType(fallbackVehicleType));
    }

    public static String zoneForType(String vehicleType) {
        return switch (normalizeVehicleType(vehicleType)) {
            case "SUV_CUV_MPV" -> "F2";
            case "VAN_TRUCK" -> "B2";
            case "MINIBUS_16" -> "B1";
            default -> "F1";
        };
    }

    private static final ConcurrentMap<String, String> drawnImageCache = new ConcurrentHashMap<>();

    public static String resolveImageUrl(String plate, String scanType, String fallback) {
        String normalizedPlate = normalizePlate(plate);
        if (normalizedPlate.isBlank()) {
            return fallback == null || fallback.isBlank() ? SEDAN_IMAGE : fallback;
        }

        // Return cached drawn image if exists
        String cached = drawnImageCache.get(normalizedPlate);
        if (cached != null) {
            return cached;
        }

        // If fallback already has a generated plate, just cache and return it
        if (fallback != null && fallback.contains("/uploads/")) {
            drawnImageCache.put(normalizedPlate, fallback);
            return fallback;
        }

        // Otherwise resolve model-specific base image
        String baseImage = findByPlate(plate)
                .map(Profile::imageUrl)
                .orElseGet(() -> imageForType(resolveVehicleType(plate, null)));

        if (baseImage == null || baseImage.isBlank()) {
            baseImage = fallback == null || fallback.isBlank() ? SEDAN_IMAGE : fallback;
        }

        // Generate drawn image on-the-fly and cache it
        String drawnImage = drawPlateOnImage(baseImage, plate);
        drawnImageCache.put(normalizedPlate, drawnImage);
        return drawnImage;
    }

    public static String imageForType(String vehicleType) {
        return switch (normalizeVehicleType(vehicleType)) {
            case "SUV_CUV_MPV" -> SUV_IMAGE;
            case "VAN_TRUCK" -> VAN_IMAGE;
            case "MINIBUS_16" -> MINIBUS_IMAGE;
            default -> SEDAN_IMAGE;
        };
    }

    public static String imageForModel(String model) {
        if (model == null) return "/images/raize.png";
        String lower = model.toLowerCase(Locale.ROOT);
        if (lower.contains("vios")) return "/images/vios.png";
        if (lower.contains("raize")) return "/images/raize.png";
        if (lower.contains("accent")) return "/images/accent.png";
        if (lower.contains("morning")) return "/images/morning.png";
        if (lower.contains("mazda 3")) return "/images/mazda3.png";
        if (lower.contains("vf e34")) return "/images/vfe34.png";
        if (lower.contains("vf 5")) return "/images/vf5.png";
        if (lower.contains("model 3")) return "/images/tesla_model_3.png";
        if (lower.contains("camry")) return "/images/camry.png";
        if (lower.contains("everest")) return "/images/everest.png";
        if (lower.contains("santa fe")) return "/images/santafe.png";
        if (lower.contains("sorento")) return "/images/sorento.png";
        if (lower.contains("vf 9")) return "/images/vf9.png";
        if (lower.contains("cr-v")) return "/images/crv.png";
        if (lower.contains("transit van")) return "/images/transit_van.png";
        if (lower.contains("transit 16")) return "/images/transit_16.png";
        if (lower.contains("transit")) return "/images/transit.png";
        if (lower.contains("porter")) return "/images/porter.png";
        if (lower.contains("carnival")) return "/images/carnival.png";
        if (lower.contains("granvia")) return "/images/granvia.png";
        if (lower.contains("sprinter")) return "/images/sprinter.png";
        return "/images/raize.png";
    }

    public static String drawPlateOnImage(String baseImageUrl, String plate) {
        if (plate == null || plate.isBlank() || "UNKNOWN_PLATE".equalsIgnoreCase(plate)) {
            return baseImageUrl;
        }
        return generateCropImageIfMissing(plate, baseImageUrl);
    }

    private static String generateCropImageIfMissing(String plate, String baseImageUrl) {
        if (plate == null || plate.isBlank()) {
            return baseImageUrl;
        }
        
        String displayPlate = plate.toUpperCase(Locale.ROOT);
        if (displayPlate.endsWith(".SIM")) {
            displayPlate = displayPlate.substring(0, displayPlate.length() - 4);
        }
        String safePlateName = displayPlate.replaceAll("[^A-Z0-9-]", "_");
        String outputFileName = "plate_" + safePlateName + ".png";
        
        File uploadDir = new File("c:/SWP391/frontend/public/uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        File outputFile = new File(uploadDir, outputFileName);
        if (outputFile.exists()) {
            return "/uploads/" + outputFileName;
        }
        
        try {
            String fileName = baseImageUrl;
            if (fileName.startsWith("/images/")) {
                fileName = fileName.substring("/images/".length());
            } else if (fileName.contains("/")) {
                fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
            }
            
            File sourceFile = new File("c:/SWP391/frontend/public/images/" + fileName);
            if (!sourceFile.exists()) {
                sourceFile = new File("c:/SWP391/frontend/public/images/raize.png");
            }
            
            if (!sourceFile.exists()) {
                return baseImageUrl;
            }
            
            BufferedImage img = ImageIO.read(sourceFile);
            if (img == null) {
                return baseImageUrl;
            }
            
            BufferedImage drawnImg = new BufferedImage(
                    img.getWidth(), img.getHeight(), BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = drawnImg.createGraphics();
            
            g.drawImage(img, 0, 0, null);
            
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, 
                    RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, 
                    RenderingHints.VALUE_ANTIALIAS_ON);
            
            int imgW = img.getWidth();
            int imgH = img.getHeight();
            
            int plateW = 160;
            int plateH = 45;
            int plateX = 35;
            int plateY = imgH - plateH - 35;
            
            g.setColor(Color.WHITE);
            g.fillRoundRect(plateX, plateY, plateW, plateH, 8, 8);
            
            g.setColor(Color.BLACK);
            g.setStroke(new BasicStroke(2.0f));
            g.drawRoundRect(plateX, plateY, plateW, plateH, 8, 8);
            
            g.setColor(new Color(200, 200, 200));
            g.drawRoundRect(plateX + 3, plateY + 3, plateW - 6, plateH - 6, 6, 6);
            
            g.setColor(Color.BLACK);
            Font plateFont = new Font("Arial", Font.BOLD, 22);
            g.setFont(plateFont);
            
            FontMetrics fm = g.getFontMetrics(plateFont);
            int textW = fm.stringWidth(displayPlate);
            int textH = fm.getAscent();
            int textX = plateX + (plateW - textW) / 2;
            int textY = plateY + (plateH + textH) / 2 - 2;
            
            g.drawString(displayPlate, textX, textY);
            g.dispose();
            
            ImageIO.write(drawnImg, "png", outputFile);
            
            return "/uploads/" + outputFileName;
        } catch (Exception e) {
            e.printStackTrace();
            return baseImageUrl;
        }
    }

    private static Profile p(String plate, String model, String brand, String vehicleType, String fuelType,
            boolean vip, String color, String colorRgb) {
        String normalizedType = normalizeVehicleType(vehicleType);
        String imageUrl = imageForModel(model);
        String docUrl = "/images/" + normalizePlate(plate).replaceAll("[^A-Z0-9]", "_") + "_registration.svg";
        return new Profile(
                plate,
                model,
                brand,
                normalizedType,
                fuelType,
                vip,
                color,
                colorRgb,
                normalizedType,
                zoneForType(normalizedType),
                imageUrl,
                docUrl,
                imageUrl,
                docUrl);
    }
}

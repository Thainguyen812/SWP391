package com.parking.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "weekly_schedules")
public class WeeklySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "mon")
    private String mon = "Nghỉ";

    @Column(name = "tue")
    private String tue = "Nghỉ";

    @Column(name = "wed")
    private String wed = "Nghỉ";

    @Column(name = "thu")
    private String thu = "Nghỉ";

    @Column(name = "fri")
    private String fri = "Nghỉ";

    @Column(name = "sat")
    private String sat = "Nghỉ";

    @Column(name = "sun")
    private String sun = "Nghỉ";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getMon() { return mon; }
    public void setMon(String mon) { this.mon = mon; }

    public String getTue() { return tue; }
    public void setTue(String tue) { this.tue = tue; }

    public String getWed() { return wed; }
    public void setWed(String wed) { this.wed = wed; }

    public String getThu() { return thu; }
    public void setThu(String thu) { this.thu = thu; }

    public String getFri() { return fri; }
    public void setFri(String fri) { this.fri = fri; }

    public String getSat() { return sat; }
    public void setSat(String sat) { this.sat = sat; }

    public String getSun() { return sun; }
    public void setSun(String sun) { this.sun = sun; }
}

import { useId, useState } from "react";
import { SearchOutlined, BellOutlined, MoonOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "./TopAppBar.css";

const locations = [
  {
    id: "co-so-01",
    label: ["Cơ", "sở 01"],
    active: false,
  },
  {
    id: "co-so-02",
    label: ["Cơ sở", "02"],
    active: false,
  },
  {
    id: "toan-he-thong",
    label: ["Toàn hệ", "thống"],
    active: true,
  },
];

export const TopAppBarSection = () => {
  const searchId = useId();
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="top-app-bar">
      {/* Left Area: Search */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <label htmlFor={searchId} className="sr-only">Tìm kiếm</label>
          <SearchOutlined className="search-icon" />
          <input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm kiếm..."
            className="search-input"
          />
        </div>
      </div>

      {/* Center Area: Location Selector */}
      <div className="location-nav">
        <nav className="location-list">
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`location-item ${
                loc.active ? "location-item-active" : "location-item-inactive"
              }`}
            >
              <span className={`location-text ${loc.active ? "location-text-active" : "location-text-inactive"}`}>
                {loc.label[0]} <br/> {loc.label[1]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right Area: Actions & Avatar */}
      <div className="actions-container">
        <button className="status-btn">
          <CheckCircleOutlined className="status-icon" />
          <span className="status-text">Trạng thái Hệ thống</span>
        </button>

        <div className="icons-group">
          <button className="icon-btn">
            <BellOutlined />
          </button>
          <button className="icon-btn">
            <MoonOutlined />
          </button>
          <button className="avatar-btn">
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="avatar-img" />
          </button>
        </div>
      </div>
    </header>
  );
};

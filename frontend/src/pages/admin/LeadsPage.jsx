import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import { getLeads } from "../../api/leads";

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    async function loadLeads() {
      const token = localStorage.getItem("admin_token");

      try {
        const data = await getLeads(token);
        setLeads(data);
      } catch (error) {
        console.error("Ошибка загрузки заявок:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString("ru-RU");
  }

  function getExportRows() {
    return leads.map((lead) => ({
      ID: lead.id,
      Имя: lead.name || "—",
      Email: lead.email || "—",
      Телефон: lead.phone || "—",
      Сообщение: lead.message || "—",
      Дата: formatDate(lead.created_at),
    }));
  }

  function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  function exportToCsv() {
    const rows = getExportRows();

    const headers = Object.keys(rows[0] || {
      ID: "",
      Имя: "",
      Email: "",
      Телефон: "",
      Сообщение: "",
      Дата: "",
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header] ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    downloadFile(blob, "leads.csv");
    setExportOpen(false);
  }

  function exportToXlsx() {
    const rows = getExportRows();

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заявки");
    XLSX.writeFile(workbook, "leads.xlsx");

    setExportOpen(false);
  }

  if (loading) {
    return (
      <section className="admin-card">
        <h2>Заявки с сайта</h2>
        <p>Загрузка заявок...</p>
      </section>
    );
  }

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Заявки с сайта</h2>
          <p>Список заявок, отправленных через сайт.</p>
        </div>

        <div className="export-wrapper">
          <button
            className="admin-button"
            type="button"
            disabled={leads.length === 0}
            onClick={() => setExportOpen((prev) => !prev)}
          >
            Экспорт
          </button>

          {exportOpen && (
            <div className="export-menu">
              <button type="button" onClick={exportToXlsx}>
                Скачать .xlsx
              </button>

              <button type="button" onClick={exportToCsv}>
                Скачать .csv
              </button>
            </div>
          )}
        </div>
      </div>

      {leads.length === 0 ? (
        <p>Заявок пока нет.</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Сообщение</th>
                <th>Дата</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.id}</td>
                  <td>{lead.name || "—"}</td>
                  <td>{lead.email || "—"}</td>
                  <td>{lead.phone || "—"}</td>
                  <td>{lead.message || "—"}</td>
                  <td>{formatDate(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default LeadsPage;
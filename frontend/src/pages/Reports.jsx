import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const reportRef = useRef();

  useEffect(() => {
    if (user) {
      fetchReport();
    }
  }, [user, year, month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly?year=${year}&month=${month}`);
      setReport(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`report_${year}_${month}.pdf`);
    } catch (err) {
      showModal('Error', 'Failed to generate PDF.');
    }
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to view your reports.</h3>
        <Button as={Link} to="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container className="my-5 text-center">
        <h3>No data for this month.</h3>
        <Button as={Link} to="/dashboard" variant="outline-primary">Back to Dashboard</Button>
      </Container>
    );
  }

  const { mood, moodDistribution, stressTrend, sleep, journal, habitCompletion, assessments, wellness, recommendations, summary } = report;

  // Chart data
  const moodDistData = {
    labels: ['😭', '😔', '😐', '🙂', '😊'],
    datasets: [{
      label: 'Days',
      data: [0,0,0,0,0],
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
    }]
  };
  if (moodDistribution) {
    moodDistribution.forEach(d => {
      moodDistData.datasets[0].data[d.mood_score - 1] = d.count;
    });
  }

  const stressData = {
    labels: stressTrend.map(s => `Week ${s.week_number}`),
    datasets: [{
      label: 'Avg Stress (1-5)',
      data: stressTrend.map(s => s.avg_stress),
      borderColor: '#ef4444',
      tension: 0.3,
    }]
  };

  const habitData = {
    labels: habitCompletion.map(h => h.name),
    datasets: [{
      label: 'Completion Rate %',
      data: habitCompletion.map(h => h.completion_rate),
      backgroundColor: '#3b82f6',
    }]
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Monthly Report</h2>
        <div>
          <Form className="d-inline-flex gap-2 me-2">
            <Form.Control
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ width: '80px' }}
            />
            <Form.Select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{ width: '100px' }}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </Form.Select>
            <Button variant="primary" onClick={fetchReport}>Update</Button>
          </Form>
          <Button variant="success" onClick={downloadPDF}>📄 Download PDF</Button>
        </div>
      </div>

      <div ref={reportRef} className="p-3 border rounded bg-white" style={{ maxWidth: '100%' }}>
        <h3 className="text-center">Chiyembekezo - Monthly Wellness Report</h3>
        <p className="text-center text-muted">{report.month}</p>

        {/* Summary */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="feature-card text-center p-2">
              <h6>Tracked Days</h6>
              <h4>{summary.trackedDays} / {summary.totalDays}</h4>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${summary.completionRate}%` }}>{summary.completionRate}%</div>
              </div>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="feature-card text-center p-2">
              <h6>Avg Mood</h6>
              <h4>{mood.avg_mood ? mood.avg_mood.toFixed(1) : 'N/A'}</h4>
              <span className="text-muted">out of 5</span>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="feature-card text-center p-2">
              <h6>Avg Sleep</h6>
              <h4>{sleep.avg_sleep ? sleep.avg_sleep.toFixed(1) : 'N/A'}</h4>
              <span className="text-muted">hours</span>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="feature-card text-center p-2">
              <h6>Journal Entries</h6>
              <h4>{journal.journal_count}</h4>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row>
          <Col md={6}>
            <Card className="feature-card p-3 mb-3">
              <h6>Mood Distribution</h6>
              <div style={{ height: '200px' }}>
                <Doughnut data={moodDistData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="feature-card p-3 mb-3">
              <h6>Stress Trend (weekly)</h6>
              <div style={{ height: '200px' }}>
                <Line data={stressData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="feature-card p-3 mb-3">
              <h6>Habit Completion</h6>
              <div style={{ height: '200px' }}>
                <Bar data={habitData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="feature-card p-3 mb-3">
              <h6>Wellness Activities</h6>
              {wellness.length === 0 ? (
                <p className="text-muted">No wellness activities this month.</p>
              ) : (
                <ul className="list-unstyled">
                  {wellness.map(w => (
                    <li key={w.session_type}>
                      <strong>{w.session_type}:</strong> {w.count} sessions ({Math.round(w.total_seconds / 60)} min)
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Col>
        </Row>

        {/* Assessments */}
        {assessments.length > 0 && (
          <Card className="feature-card p-3 mb-3">
            <h6>Recent Assessments</h6>
            <ul className="list-unstyled">
              {assessments.slice(0, 3).map((a, idx) => (
                <li key={idx} className="border-bottom py-1">
                  <strong>{a.assessment_type}</strong> – {a.severity_level} (Score: {a.score})
                  <span className="text-muted small"> {new Date(a.taken_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="feature-card p-3 mb-3 border-warning">
            <h6>💡 Recommendations</h6>
            <ul className="list-unstyled">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="mb-1">• {rec.message}</li>
              ))}
            </ul>
          </Card>
        )}

        <div className="text-center text-muted small mt-3">
          Report generated on {new Date().toLocaleString()}
        </div>
      </div>

      <div className="mt-3">
        <Button as={Link} to="/dashboard" variant="outline-secondary">← Back to Dashboard</Button>
      </div>
    </Container>
  );
};

export default Reports;
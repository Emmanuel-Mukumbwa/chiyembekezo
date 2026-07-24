import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Tabs, Tab, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const GetStarted = () => {
  const [activeTab, setActiveTab] = useState('individual');

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">Welcome to Chiyembekezo 👋</h1>
          <p className="hero-subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
            Let's help you become familiar with the platform. Whether you're here to improve your wellbeing,
            support someone else, or simply learn more about mental health, this guide will walk you through every major feature.
          </p>
          <div className="mt-3 d-flex flex-wrap justify-content-center gap-3">
            <Badge bg="light" text="dark" className="p-2">📖 Estimated reading time: 8 min</Badge>
            <Badge bg="light" text="dark" className="p-2">🎯 Interactive tour (coming soon)</Badge>
          </div>
          <Button as={Link} to="/register" variant="primary" size="lg" className="mt-3">
            Create Free Account
          </Button>
        </Container>
      </section>

      <Container className="my-5">
        <Row>
          <Col lg={10} className="mx-auto">

            {/* ===== 1. FIRST-TIME USER CHECKLIST ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">✅ Your First‑Time User Checklist</h4>
              <p className="text-muted">Follow these steps to get the most out of Chiyembekezo from day one.</p>
              <ListGroup variant="flush">
                <ListGroup.Item>✅ Create your account</ListGroup.Item>
                <ListGroup.Item>⬜ Complete your profile (add name, district, emergency contact)</ListGroup.Item>
                <ListGroup.Item>⬜ Record your first mood check‑in</ListGroup.Item>
                <ListGroup.Item>⬜ Take your first self‑assessment (PHQ‑9 or GAD‑7)</ListGroup.Item>
                <ListGroup.Item>⬜ Explore the Wellness Toolkit (try a breathing exercise)</ListGroup.Item>
                <ListGroup.Item>⬜ Write your first journal entry</ListGroup.Item>
                <ListGroup.Item>⬜ Set your first wellness goal</ListGroup.Item>
                <ListGroup.Item>⬜ Download your Safety Plan (optional but recommended)</ListGroup.Item>
              </ListGroup>
            </Card>

            {/* ===== 2. PLATFORM JOURNEY (VISUAL FLOW) ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">🗺️ Your Platform Journey</h4>
              <p className="text-muted">How everything connects – from sign‑up to daily use.</p>
              <div className="d-flex flex-wrap justify-content-center gap-3 text-center">
                {[
                  { step: '1', label: 'Sign Up' },
                  { step: '2', label: 'Dashboard' },
                  { step: '3', label: 'Mood Tracker' },
                  { step: '4', label: 'Journal' },
                  { step: '5', label: 'Assessments' },
                  { step: '6', label: 'Toolkit' },
                  { step: '7', label: 'Goals' },
                  { step: '8', label: 'Community' },
                  { step: '9', label: 'Professional Help' },
                ].map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      {item.step}
                    </div>
                    <div className="ms-2 small">{item.label}</div>
                    {idx < 8 && <div className="text-muted mx-2">→</div>}
                  </div>
                ))}
              </div>
            </Card>

            {/* ===== 3. DASHBOARD ANNOTATION ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">📊 Understanding Your Dashboard</h4>
              <p className="text-muted">Your dashboard is your home base. Here's what each part does.</p>
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item><strong>① Quick Actions</strong> – One‑click access to journal, assessments, goals, and more.</ListGroup.Item>
                    <ListGroup.Item><strong>② Today's Mood</strong> – Record your daily check‑in.</ListGroup.Item>
                    <ListGroup.Item><strong>③ Recent Journal</strong> – See your latest entries and jump straight in.</ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item><strong>④ Recommendations</strong> – Personalised suggestions based on your mood and activity.</ListGroup.Item>
                    <ListGroup.Item><strong>⑤ Achievements</strong> – Track your streaks and earned badges.</ListGroup.Item>
                    <ListGroup.Item><strong>⑥ Active Goals</strong> – Monitor progress on your current wellness goals.</ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card>

            {/* ===== 4. DAILY JOURNEY ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">☀️ A Typical Day with Chiyembekezo</h4>
              <p className="text-muted">Here's how a regular day might look using the platform.</p>
              <Row className="text-center">
                <Col md={4} className="mb-3">
                  <div className="bg-light p-3 rounded">
                    <h6>🌅 Morning</h6>
                    <ul className="list-unstyled">
                      <li>✔ Complete mood check‑in</li>
                      <li>✔ Drink water</li>
                      <li>✔ 5‑min meditation</li>
                    </ul>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="bg-light p-3 rounded">
                    <h6>🌞 Afternoon</h6>
                    <ul className="list-unstyled">
                      <li>✔ Walk / exercise</li>
                      <li>✔ Listen to relaxation sounds</li>
                      <li>✔ Review goals</li>
                    </ul>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="bg-light p-3 rounded">
                    <h6>🌙 Evening</h6>
                    <ul className="list-unstyled">
                      <li>✔ Journal</li>
                      <li>✔ Sleep timer</li>
                      <li>✔ Reflect on the day</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* ===== 5. WEEKLY JOURNEY ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">📅 A Sample Weekly Routine</h4>
              <Row className="text-center">
                {[
                  { day: 'Mon', activity: 'Mood check‑in' },
                  { day: 'Tue', activity: 'Journal' },
                  { day: 'Wed', activity: 'Meditation' },
                  { day: 'Thu', activity: 'Assessment' },
                  { day: 'Fri', activity: 'Goals review' },
                  { day: 'Sat', activity: 'Community' },
                  { day: 'Sun', activity: 'Reflection' },
                ].map((item, idx) => (
                  <Col key={idx} className="mb-2">
                    <div className="bg-light p-2 rounded">
                      <strong>{item.day}</strong>
                      <div className="small">{item.activity}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* ===== 6. ROLE GUIDES (TABS) ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">👤 Role‑Specific Guides</h4>
              <p className="text-muted">Choose your role to see what's most relevant to you.</p>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="individual" title="🧑 Individual">
                  <ul>
                    <li><strong>Dashboard</strong> – Your personal wellness hub.</li>
                    <li><strong>Mood & Journal</strong> – Track emotions and thoughts.</li>
                    <li><strong>Wellness Toolkit</strong> – Breathing, meditation, grounding.</li>
                    <li><strong>Assessments</strong> – Understand your mental health.</li>
                    <li><strong>Community</strong> – Share and connect anonymously.</li>
                    <li><strong>Appointments</strong> – Book with professionals.</li>
                  </ul>
                </Tab>
                <Tab eventKey="professional" title="👨‍⚕️ Professional">
                  <ul>
                    <li><strong>Dashboard</strong> – Overview of patients and appointments.</li>
                    <li><strong>Patients</strong> – View patient history and notes.</li>
                    <li><strong>Appointments</strong> – Manage schedule and availability.</li>
                    <li><strong>Analytics</strong> – See aggregate patient wellness trends.</li>
                    <li><strong>Resources</strong> – Access professional materials.</li>
                  </ul>
                </Tab>
                <Tab eventKey="volunteer" title="🤝 Volunteer">
                  <ul>
                    <li><strong>Dashboard</strong> – Requests and active support sessions.</li>
                    <li><strong>Available Requests</strong> – Claim peer support requests.</li>
                    <li><strong>Messages</strong> – Communicate with those you support.</li>
                    <li><strong>Training</strong> – Access volunteer resources.</li>
                  </ul>
                </Tab>
                <Tab eventKey="org" title="🏢 Organization">
                  <ul>
                    <li><strong>Dashboard</strong> – Group wellness insights.</li>
                    <li><strong>Members</strong> – Manage your organisation's members.</li>
                    <li><strong>Reports</strong> – Aggregated wellness data.</li>
                    <li><strong>Resources</strong> – Share wellness content with your team.</li>
                  </ul>
                </Tab>
              </Tabs>
            </Card>

            {/* ===== 7. FEATURE SCENARIOS (USE CASES) ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">💡 Real‑Life Use Cases</h4>
              <p className="text-muted">Not sure where to start? Try one of these scenarios.</p>
              <Row>
                <Col md={4} className="mb-3">
                  <div className="border rounded p-3 h-100">
                    <h6>😰 I'm Feeling Stressed</h6>
                    <ol className="small">
                      <li>Open Wellness Toolkit</li>
                      <li>Try Box Breathing</li>
                      <li>Journal your thoughts</li>
                      <li>Check mood after</li>
                    </ol>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="border rounded p-3 h-100">
                    <h6>😴 I Can't Sleep</h6>
                    <ol className="small">
                      <li>Take Sleep Assessment (ISI)</li>
                      <li>Listen to Sleep Meditation</li>
                      <li>Use White Noise</li>
                      <li>Log sleep hours</li>
                    </ol>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="border rounded p-3 h-100">
                    <h6>💬 I'm Feeling Lonely</h6>
                    <ol className="small">
                      <li>Join Community Forum</li>
                      <li>Request Peer Support</li>
                      <li>Read others' stories</li>
                      <li>Consider professional help</li>
                    </ol>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* ===== 8. TIPS & BEST PRACTICES ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">💡 Tips for Success</h4>
              <Row>
                <Col md={6}>
                  <ul>
                    <li>✔ Record your mood daily – even when you feel fine.</li>
                    <li>✔ Journal regularly to process emotions.</li>
                    <li>✔ Take a self‑assessment monthly.</li>
                    <li>✔ Update your goals regularly.</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul>
                    <li>✔ Create a Safety Plan before you need it.</li>
                    <li>✔ Reach out early – don't wait until you're overwhelmed.</li>
                    <li>✔ Celebrate small wins (streaks, achievements).</li>
                    <li>✔ Explore all modules – you might discover new tools.</li>
                  </ul>
                </Col>
              </Row>
            </Card>

            {/* ===== 9. UNDERSTANDING PRIVACY ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">🔒 Understanding Your Privacy</h4>
              <Table striped bordered hover responsive>
                <thead>
                  <tr><th>Data</th><th>Who Can See It</th></tr>
                </thead>
                <tbody>
                  <tr><td>Journal entries</td><td>Only you</td></tr>
                  <tr><td>Mood history</td><td>Only you</td></tr>
                  <tr><td>Assessment results</td><td>Only you (can share with professional)</td></tr>
                  <tr><td>Community posts</td><td>Everyone (anonymously if you choose)</td></tr>
                  <tr><td>Appointments</td><td>You + professional</td></tr>
                  <tr><td>Safety Plan</td><td>Only you</td></tr>
                </tbody>
              </Table>
            </Card>

            {/* ===== 10. "WHAT HAPPENS IF..." ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">❓ What Happens If…</h4>
              <Row>
                <Col md={6}>
                  <p><strong>…I forget my password?</strong> → Click "Forgot password" on the login page to reset it.</p>
                  <p><strong>…I finish an assessment?</strong> → You'll see your score, severity level, and personalised recommendations.</p>
                  <p><strong>…Can professionals see my journal?</strong> → No, your journal is completely private.</p>
                </Col>
                <Col md={6}>
                  <p><strong>…I want to delete my account?</strong> → Go to Profile → Settings → Delete Account.</p>
                  <p><strong>…I want to download my data?</strong> → Contact support to request a data export.</p>
                  <p><strong>…I'm in crisis?</strong> → Click the 🚨 Emergency button for immediate contacts.</p>
                </Col>
              </Row>
            </Card>

            {/* ===== 11. LEARNING PATH (GAMIFIED) ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">🏆 Your Learning Path</h4>
              <p className="text-muted">Progress through levels as you engage with the platform.</p>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {[
                  { level: 1, label: 'Sign Up' },
                  { level: 2, label: 'Mood Tracker' },
                  { level: 3, label: 'Journal' },
                  { level: 4, label: 'Toolkit' },
                  { level: 5, label: 'Goals' },
                  { level: 6, label: 'Community' },
                  { level: 7, label: 'Professional Help' },
                ].map((item) => (
                  <div key={item.level} className="text-center">
                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '50px', height: '50px' }}>
                      {item.level}
                    </div>
                    <div className="small mt-1">{item.label}</div>
                    {item.level < 7 && <div className="text-muted">⬇</div>}
                  </div>
                ))}
              </div>
            </Card>

            {/* ===== 12. VIDEO TUTORIALS (PLACEHOLDER) ===== */}
            <Card className="feature-card p-4 mb-4">
              <h4 className="mb-3">🎬 Video Tutorials</h4>
              <p className="text-muted">Coming soon – short videos to guide you through the platform.</p>
              <Row>
                {[
                  'Getting Started (3 min)',
                  'Dashboard Tour',
                  'Journal',
                  'Assessments',
                  'Wellness Toolkit',
                  'Booking Appointments',
                  'Community',
                  'Safety Plan',
                ].map((title, idx) => (
                  <Col md={3} sm={6} key={idx} className="mb-2">
                    <Button variant="outline-secondary" size="sm" className="w-100" disabled>
                      ▶ {title}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* ===== FINAL CTA ===== */}
            <div className="text-center mt-4">
              <h4>Ready to begin your wellness journey?</h4>
              <p>Start now – it's free and takes less than 2 minutes.</p>
              <Button as={Link} to="/register" variant="primary" size="lg">
                Create Free Account
              </Button>
              <p className="text-muted mt-3 small">
                Already have an account? <Link to="/login">Log in here</Link>.
              </p>
            </div>

            {/* ===== ADDITIONAL HELP ===== */}
            <Card className="feature-card p-4 mt-4">
              <h5>Still have questions?</h5>
              <p>
                Visit our <Link to="/faq">FAQ page</Link> for common questions, or <Link to="/contact">contact our support team</Link>.
              </p>
            </Card>

          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default GetStarted;
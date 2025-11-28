import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Form, Button, Accordion, Modal, Spinner, Card, Navbar, Nav, Badge } from 'react-bootstrap'
import Logo from './assets/logo.svg'
import ReactQuill from 'react-quill'
import DOMPurify from 'dompurify'

const typeLanguageMap = {
  'Front-End': ['HTML', 'CSS', 'JQuery', 'JavaScript', 'Ajax', 'Bootstrap', 'ReactJS'],
  'Back-End': ['CoreJava','Servlet','Spring Boot', 'Hibernate', 'Spring Security', 'RESTful Web Services'],
  'Database': ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'],
  'Architecture': ['Monolithic', 'Microservices'],
  'Unit Testing': ['JUnit', 'Mockito'],
  'Automation Testing Frameworks': ['Selenium', 'TestNG', 'Cucumber', 'JUnit'],
  'API Testing': ['Postman', 'WSO2'],
  'Load Testing': ['JMeter'],
  'CI/CD': ['Jenkins', 'Bamboo'],
  'Version Control': ['Git', 'GitHub', 'GitLab', 'BitBucket'],
  'Artifact Management': ['JFrog'],
  'IDE': ['Eclipse', 'IntelliJ', 'VS Code', 'STS'],
  'Operating Systems': ['Windows', 'Linux (CentOS)'],
  'PMTools': ['JIRA', 'Azure Boards'],
  'Cloud': ['AWS', 'Microsoft Azure', 'VMware ESXi']
}

const initialForm = {
  type: 'Front-End',
  language: typeLanguageMap['Front-End'][0],
  question: '',
  explanation: '',
  usecase: '',
  exampleCode: '',
  output: '',
  summary: ''
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState(null)
  const savedRef = useRef(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [typeCounts, setTypeCounts] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')

  // API base URL (Vite env or fallback)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8089/api/qas'

  const fetchList = async () => {
    setLoadingItems(true)
    try {
      const resp = await fetch(API_URL)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const list = await resp.json()
      setItems(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to load items', err)
    } finally {
      setLoadingItems(false)
    }
  }

  const fetchCounts = async () => {
    try {
      // derive counts endpoint by appending /type-counts to base API URL
      const countsUrl = (API_URL.endsWith('/api/qas') ? API_URL + '/type-counts' : API_URL.replace(/\/$/, '') + '/type-counts')
      const resp = await fetch(countsUrl)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const list = await resp.json()
      // list expected [{ key: 'Front-End', value: 1 }, ...]
      const map = {}
      Array.isArray(list) && list.forEach((it) => { if (it && it.key) map[it.key] = it.value || 0 })
      setTypeCounts(map)
    } catch (err) {
      console.error('Failed to load type counts', err)
    }
  }

  useEffect(() => {
    fetchList()
    fetchCounts()
  }, [])

  // reset to first page whenever filter/items/pageSize/searchTerm changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTypeFilter, pageSize, items, searchTerm])

  const handleCardClick = (type) => {
    setSelectedTypeFilter(type)
    setActiveTab('qa')
    setShowForm(false)
    // scroll to saved questions
    setTimeout(() => {
      try {
        savedRef.current?.scrollIntoView({ behavior: 'smooth' })
      } catch (e) {
        // ignore
      }
    }, 100)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    // simple client-side "logout" behaviour: clear state and go to dashboard
    setItems([])
    setForm(initialForm)
    setSelectedTypeFilter(null)
    setActiveTab('dashboard')
    setShowLogoutConfirm(false)
    // optionally reload the page: window.location.reload()
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    if (id === 'type') {
      const newType = value
      const newLanguages = typeLanguageMap[newType] || []
      setForm((f) => ({ ...f, type: newType, language: newLanguages[0] || '' }))
    } else {
      setForm((f) => ({ ...f, [id]: value }))
    }
  }

  const addQA = async () => {
    if (!form.question.trim()) {
      alert('Please enter a question')
      return
    }

    // Backend endpoint - configurable via Vite env `VITE_API_URL` or fallback to localhost
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8089/api/qas'

    try {
      setSaving(true)
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(text || `HTTP ${resp.status}`)
      }

      const saved = await resp.json().catch(() => null)

      // Refresh list and counts from backend and show confirmation
      await fetchList()
      await fetchCounts()
      setForm({ ...initialForm, language: typeLanguageMap[initialForm.type][0] })
      setShowSavedModal(true)
    } catch (err) {
      console.error('Save failed', err)
      alert('Failed to save: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  const typeOptions = Object.keys(typeLanguageMap)
  const languageOptions = typeLanguageMap[form.type] || []
    const typeIconMap = {
      'Front-End': '⚛️',
      'Back-End': '☕️',
      'Database': '🗄️',
      'Architecture': '🏗️',
      'Unit Testing': '✅',
      'Automation Testing Frameworks': '🤖',
      'API Testing': '📡',
      'Load Testing': '📈',
      'CI/CD': '🔁',
      'Version Control': '🔧',
      'Artifact Management': '📦',
      'IDE': '💻',
      'Operating Systems': '🖥️',
      'PMTools': '📋',
      'Cloud': '☁️'
    }

    const quillModules = {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'clean']
      ]
    }

    const quillFormats = [
      'header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'blockquote', 'code-block', 'list', 'bullet', 'indent', 'link'
    ]

    const handleQuillChange = (field) => (value) => {
      setForm((f) => ({ ...f, [field]: value }))
    }

  return (
    <>
      <Navbar expand="md" className="mb-3" style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)' }} variant="dark">
        <Container>
          <Navbar.Brand style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={Logo} alt="InterviewHub" style={{ width: 34, height: 34 }} />
            InterviewHub
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto" activeKey={activeTab}>
              <Nav.Link
                eventKey="dashboard"
                onClick={() => setActiveTab('dashboard')}
                style={{ color: activeTab === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.85)', fontWeight: activeTab === 'dashboard' ? 700 : 500 }}
              >
                Dashboard
              </Nav.Link>
              <Nav.Link
                eventKey="qa"
                onClick={() => { setActiveTab('qa'); setShowForm(true); }}
                style={{ color: activeTab === 'qa' ? '#fff' : 'rgba(255,255,255,0.85)', fontWeight: activeTab === 'qa' ? 700 : 500 }}
              >
                Question &amp; Answer
              </Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Link onClick={handleLogout} style={{ color: '#fff', fontWeight: 600 }}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="my-4">
        {activeTab === 'dashboard' && (
          <div className="mb-4">
            <h4 className="text-secondary mb-3">Types Dashboard</h4>
            <Row xs={1} sm={2} md={4} className="g-3">
              {typeOptions.map((t) => (
                <Col key={t}>
                  <Card className="h-100" role="button" onClick={() => handleCardClick(t)}>
                    <Card.Body>
                      <Card.Title>
                        <span style={{ fontSize: 22, marginRight: 8 }}>{typeIconMap[t] || '❓'}</span>
                        <span style={{ verticalAlign: 'middle' }}>{t}</span>
                        <Badge bg="light" text="dark" pill style={{ float: 'right', fontWeight: 600 }}>{typeCounts[t] || 0}</Badge>
                      </Card.Title>
                      <Card.Text className="text-muted" style={{fontSize: 13}}>
                        { (typeLanguageMap[t] || []).slice(0,3).join(', ') }
                        { (typeLanguageMap[t] || []).length > 3 ? '...' : '' }
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            {selectedTypeFilter && (
              <div className="mt-2">
                <Button variant="outline-secondary" size="sm" onClick={() => setSelectedTypeFilter(null)}>Clear filter</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'qa' && (
          <>
          {showForm && (
            <>
            <div className="container-box p-4 bg-white rounded shadow-sm">
              <h3 className="mb-3 text-primary">Add Interview Question & Answer</h3>

              <Form>
            <Row>
            <Col md={4} className="mb-3">
              <Form.Label className="fw-bold">Type</Form.Label>
              <Form.Select id="type" value={form.type} onChange={handleChange}>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Label className="fw-bold">Programming Language</Form.Label>
              <Form.Select id="language" value={form.language} onChange={handleChange}>
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </Form.Select>
            </Col>

           
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Question</Form.Label>
            <Form.Control id="question" value={form.question} onChange={handleChange} placeholder="Java 8 Features" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Explanation</Form.Label>
            <ReactQuill theme="snow" value={form.explanation} onChange={handleQuillChange('explanation')} modules={quillModules} formats={quillFormats} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Real Time Use Case</Form.Label>
            <ReactQuill theme="snow" value={form.usecase} onChange={handleQuillChange('usecase')} modules={quillModules} formats={quillFormats} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Example Code</Form.Label>
            <Form.Control as="textarea" id="exampleCode" rows={8} value={form.exampleCode} onChange={handleChange} placeholder="Code" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace' }} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Output</Form.Label>
            <Form.Control as="textarea" id="output" value={form.output} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Simple Summary</Form.Label>
            <ReactQuill theme="snow" value={form.summary} onChange={handleQuillChange('summary')} modules={quillModules} formats={quillFormats} />
          </Form.Group>

          <Button variant="primary" onClick={addQA} disabled={saving}>
            {saving ? (
              <><Spinner animation="border" size="sm" /> Saving...</>
            ) : (
              'Save'
            )}
          </Button>
        </Form>
      </div>
      <hr className="my-4" />
            </>
          )}

      <div ref={savedRef}>
        <Row className="align-items-center mb-3">
          <Col>
            <h3 className="text-primary">{selectedTypeFilter ? ` ${selectedTypeFilter}` : ''}</h3>
          </Col>
          <Col md={4} sm={6} xs={12} className="text-end">
            <Form.Control
              placeholder="Search questions, use case, explanation, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ display: 'inline-block', maxWidth: '100%' }}
            />
          </Col>
        </Row>

        {loadingItems ? (
          <div className="py-4 text-center"><Spinner animation="border" /></div>
        ) : (
          <>
            {(() => {
              const filterByType = (it) => (selectedTypeFilter ? it.type === selectedTypeFilter : true)
              const stripHtml = (html) => (html ? String(html).replace(/<[^>]+>/g, ' ') : '')
              const q = (searchTerm || '').trim().toLowerCase()
              const filtered = items
                .filter(filterByType)
                .filter((it) => {
                  if (!q) return true
                  const hay = [
                    it.question,
                    stripHtml(it.explanation),
                    stripHtml(it.usecase),
                    stripHtml(it.summary),
                    it.exampleCode,
                    it.output
                  ].map((s) => (s || '').toString().toLowerCase()).join(' ')
                  return hay.indexOf(q) !== -1
                })
              const total = filtered.length
              const totalPages = Math.max(1, Math.ceil(total / pageSize))
              const start = (currentPage - 1) * pageSize
              const end = Math.min(total, start + pageSize)
              const pageItems = filtered.slice(start, end)

              return (
                <>
                  <Accordion defaultActiveKey="">
                    {pageItems.map((it, idx) => (
                      <Accordion.Item eventKey={String(start + idx)} key={it.id || start + idx}>
                        <Accordion.Header><strong>{it.question}</strong></Accordion.Header>
                        <Accordion.Body>
                              <p><strong style={{ color: '#3264b0ff' }}>Explanation:</strong></p>
                              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(it.explanation || '') }} />
                              <p><strong style={{ color: '#3264b0ff' }}>Real-Time Use Case:</strong></p>
                              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(it.usecase || '') }} />

                              <p><strong style={{ color: '#3264b0ff' }}>Example Code:</strong></p>
                              <pre style={{ background: '#272822', color: '#f8f8f2', padding: 10, borderRadius: 5, overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace' }}>
                    {it.exampleCode}
                              </pre>

                              <p><strong style={{ color: '#3264b0ff' }}>Output:</strong></p>
                              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(it.output || '') }} />
                              <p><strong style={{ color: '#3264b0ff' }}>Simple Summary:</strong></p>
                              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(it.summary || '') }} />
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>

                  {/* Pagination controls */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center">
                      <span className="me-2 text-muted">Show</span>
                      <Form.Select size="sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ width: 90 }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </Form.Select>
                      <span className="ms-2 text-muted">per page</span>
                    </div>

                    <div className="d-flex align-items-center">
                      <small className="text-muted me-3">Showing {total === 0 ? 0 : start + 1} - {end} of {total}</small>

                      <Button variant="outline-secondary" size="sm" className="me-2" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</Button>

                      {/* simple page numbers, show up to 7 buttons */}
                      {(() => {
                        const pages = []
                        const maxButtons = 7
                        let from = Math.max(1, currentPage - Math.floor(maxButtons / 2))
                        let to = from + maxButtons - 1
                        if (to > totalPages) {
                          to = totalPages
                          from = Math.max(1, to - maxButtons + 1)
                        }
                        for (let p = from; p <= to; p++) {
                          pages.push(
                            <Button key={p} size="sm" variant={p === currentPage ? 'primary' : 'outline-secondary'} className="me-1" onClick={() => setCurrentPage(p)}>{p}</Button>
                          )
                        }
                        return pages
                      })()}

                      <Button variant="outline-secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                    </div>
                  </div>
                </>
              )
            })()}
          </>
        )}
      </div>

      <Modal show={showSavedModal} onHide={() => setShowSavedModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Saved</Modal.Title>
        </Modal.Header>
        <Modal.Body>Question &amp; Answer saved successfully.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSavedModal(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
          </>
        )}
    </Container>
    </>
  )
}

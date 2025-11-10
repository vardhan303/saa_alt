import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '../../../shared/ui';
import teamService from '../../../services/teamService';

const TeamSubmission = ({ team, onClose }) => {
  const [submission, setSubmission] = useState({
    title: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
    technologies: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    loadSubmission();
  }, [team._id]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const data = await teamService.getSubmission(team._id);
      setSubmission({
        title: data.title || '',
        description: data.description || '',
        repoUrl: data.repoUrl || '',
        demoUrl: data.demoUrl || '',
        technologies: data.technologies || []
      });
    } catch (err) {
      setError('Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmission(prev => ({ ...prev, [name]: value }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !submission.technologies.includes(techInput.trim())) {
      setSubmission(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setSubmission(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      await teamService.updateSubmission(team._id, submission);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save submission');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <p>Loading submission...</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Project Submission - {team.name}</Card.Title>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </Card.Header>
      
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Project Title *
            </label>
            <Input
              name="title"
              value={submission.title}
              onChange={handleChange}
              placeholder="Enter your project title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Project Description *
            </label>
            <textarea
              name="description"
              value={submission.description}
              onChange={handleChange}
              placeholder="Describe your project, what it does, and how you built it..."
              className="w-full p-3 border border-border rounded-lg resize-vertical min-h-[120px]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Repository URL
              </label>
              <Input
                name="repoUrl"
                value={submission.repoUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/project"
                type="url"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Demo URL
              </label>
              <Input
                name="demoUrl"
                value={submission.demoUrl}
                onChange={handleChange}
                placeholder="https://yourproject.com or video link"
                type="url"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Technologies Used
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. React, Node.js, MongoDB"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              />
              <Button type="button" onClick={addTechnology} size="sm">
                Add
              </Button>
            </div>
            {submission.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {submission.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">Submission saved successfully!</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {onClose && (
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Submission'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
};

export default TeamSubmission;
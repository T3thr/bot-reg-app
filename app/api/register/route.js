const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, lineUserId }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful!');
        setMessageType('success');
      } else {
        setMessage(data.error || 'Registration failed.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };
  
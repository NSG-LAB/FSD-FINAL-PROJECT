import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Navigation from './Navigation';

const mockStore = configureStore([]);

describe('Navigation', () => {
  it('renders navigation links', () => {
    const store = mockStore({ auth: { isAuthenticated: false, user: null } });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      </Provider>
    );
    // Check for some navigation text
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });
});

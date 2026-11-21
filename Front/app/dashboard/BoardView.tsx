'use client';

import Board from '../components/Dashboard/Board';
import { useUser } from './session';

export default function BoardView() {
  return <Board user={useUser()} />;
}

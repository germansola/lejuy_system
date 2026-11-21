'use client';

import Board from '../components/Dashboard/Board';
import { TASKS } from '../components/Dashboard/data';
import { useUser } from './session';

export default function BoardView() {
  return <Board user={useUser()} tasks={TASKS} />;
}

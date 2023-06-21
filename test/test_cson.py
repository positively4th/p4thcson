import unittest
import json

from src.cson import cson

class test_cson(unittest.TestCase):

    def test_string(self):

        exp = 'test_string'
        act = cson.fromJSON(cson.asJSON(exp)) 
        self.assertEqual(act, exp)

    def test_list(self):

        exp = ['a', 1]
        act = cson.fromJSON(cson.asJSON(exp)) 
        self.assertEqual(act, exp)


    def test_map(self):

        exp = {'a': 1, 2: 'b'}
        act = cson.fromJSON(cson.asJSON(exp)) 
        self.assertEqual(act, exp)

    def test_circular_map(self):

        a = {'id': 'a', 'next': None}
        b = {'id': 'b', 'next': None}
        c = {'id': 'c', 'next': None}
        a['next'] = b
        b['next'] = c
        c['next'] = a
        exp = a
        act = cson.fromJSON(cson.asJSON(exp)) 
        self.assertEqual(act['id'], 'a')
        self.assertEqual(act['next']['id'], 'b')
        self.assertEqual(act['next']['next']['id'], 'c')

        self.assertEqual(id(act), id(act['next']['next']['next']))
        self.assertEqual(id(act['next']), id(act['next']['next']['next']['next']))
        self.assertEqual(id(act['next']['next']), id(act['next']['next']['next']['next']['next']))


    def test_circular_list(self):

        a = {'id': 'a', 'next': None}
        b = {'id': 'b', 'next': None}
        c = {'id': 'c', 'next': None}
        a['next'] = b
        b['next'] = c
        c['next'] = a
        exp = [a, b, c]
        act = cson.fromJSON(cson.asJSON(exp)) 

        self.assertEqual(act[0]['id'], 'a')
        self.assertEqual(act[0]['next']['id'], 'b')
        self.assertEqual(act[0]['next']['next']['id'], 'c')

        self.assertEqual(id(act[0]), id(act[0]['next']['next']['next']))
        self.assertEqual(id(act[0]['next']), id(act[0]['next']['next']['next']['next']))
        self.assertEqual(id(act[0]['next']['next']), id(act[0]['next']['next']['next']['next']['next']))



if __name__ == '__main__':
    unittest.main()

    

#include <algorithm>
#include <fstream>
#include <iostream>
#include <vector>

using namespace std;

//This is the minimum gap that must exist between the ends of each pair (No sharp turns rule)
const int min_loop_length = 4;

//Function to check whether the given two bases can be paired together (only A,U and C,G can be paired)
bool pair_check(char a, char b) {
  return (a == 'A' && b == 'U') || (a == 'U' && b == 'A') ||
         (a == 'C' && b == 'G') || (a == 'G' && b == 'C');
}

//Function to compute the values to be filled in the DP matrix, values are calculated based on the recursion rule in the algorithm
int OPT(int i, int j, const string &sequence, vector<vector<int>> &DP) {
  if(DP[i][j]!= -1){
    return DP[i][j];
  }
  //OPT is 0 if i>=j-4
  if (i >= j - min_loop_length) {
    return 0;
  } 
  
  else {
    int unpaired = OPT(i, j - 1, sequence, DP);

    vector<int> pairing;
    for (int t = i; t < j - min_loop_length; ++t) {
      if (pair_check(sequence[t], sequence[j])) {
        pairing.push_back(1 + OPT(i, t - 1, sequence, DP) +
                          OPT(t + 1, j - 1, sequence, DP));
      }
    }
    int paired =
        (pairing.empty()) ? 0 : *max_element(pairing.begin(), pairing.end());

    return max(unpaired, paired);
  }
}

//Function to find the pairings in the sequence to create the secondary structure. Trace back is done from the upper right corner of the matrix (cell with the total number of pairs). We trace downward in the reverse of the direction(s) of the recursion to find the pairings.
void traceback(int i, int j, vector<pair<int, int>> &structure,
               const vector<vector<int>> &DP, const string &sequence) {
  if (j <= i) {
    return;
  } else if (DP[i][j] == DP[i][j - 1]) {
    traceback(i, j - 1, structure, DP, sequence);
  } else {
    for (int k = i; k < j - min_loop_length; ++k) {
      if (pair_check(sequence[k], sequence[j])) {
        if (k - 1 < 0) {
          if (DP[i][j] == DP[k + 1][j - 1] + 1) {
            structure.emplace_back(k, j);
            traceback(k + 1, j - 1, structure, DP, sequence);
            break;
          }
        } else if (DP[i][j] == DP[i][k - 1] + DP[k + 1][j - 1] + 1) {
          structure.emplace_back(k, j);
          traceback(i, k - 1, structure, DP, sequence);
          traceback(k + 1, j - 1, structure, DP, sequence);
          break;
        }
      }
    }
  }
}

//Function to convert the secondary structure into dot-bracket notation
string write_structure(const string &sequence,
                       const vector<pair<int, int>> &structure) {
  string dot_bracket(sequence.size(), '.');
  for (const auto &s : structure) {
    dot_bracket[s.first] = '(';
    dot_bracket[s.second] = ')';
  }
  return dot_bracket;
}

//Function to initialize the DP matrix
vector<vector<int>> initialize(int N) {
  vector<vector<int>> DP(N, vector<int>(N, -1));
  for (int k = 0; k < min_loop_length; k++) {
    for (int i = 0; i < N-k; i++) {
      int j = i+k;
      DP[i][j] = 0;
    }
  }
  return DP;
}

//Function to define the main algorithm, returns the dot-bracket notation of the secondary structure, and the list of pairs in the secondary structure
pair<string, vector<pair<int, int>>> algo(const string &sequence) {
  int N = sequence.size();
  auto DP = initialize(N);
  vector<pair<int, int>> structure;

  for (int k = min_loop_length; k < N; ++k) {
    for (int i = 0; i < N - k; ++i) {
      int j = i + k;
      DP[i][j] = OPT(i, j, sequence, DP);
    }
  }

  for (int i = 0; i < N; ++i) {
    for (int j = 0; j < i; ++j) {
      DP[i][j] = DP[j][i];
    }
  }

  traceback(0, N - 1, structure, DP, sequence);
  return {write_structure(sequence, structure), structure};
}

//RNA sequence is read from input.txt, dot-bracket notation appears in output.txt
int main() {
  ifstream infile("input.txt");
  ofstream outfile("output.txt");

  if (!infile.is_open()) {
    cerr << "Error: Unable to open input file." << endl;
    return 1;
  }

  if (!outfile.is_open()) {
    cerr << "Error: Unable to open output file." << endl;
    return 1;
  }

  string sequence;
  getline(infile, sequence);

  auto result = algo(sequence);
  outfile << result.first << endl;
  cout<<"Number of pairs: "<<result.second.size()<<"\n";
  cout << "Pairs:" << endl;
  for (const auto &pair : result.second) {
    cout << "(" << pair.first << ", " << pair.second << ")" << endl;
  }

  infile.close();
  outfile.close();

  return 0;
}

from forgi.graph.bulge_graph import BulgeGraph
from forgi.visual.mplotlib import plot_rna
import matplotlib.pyplot as plt

def plot_secondary_structure(dot_bracket_notation):
    bg = BulgeGraph.from_dotbracket(dot_bracket_notation)
    fig, ax = plt.subplots(figsize=(10, 5))
    plot_rna(bg, ax=ax)
    plt.show()

def read_dot_bracket_notation(filename):
    with open(filename, 'r') as file:
        return file.readline().strip()

if _name_ == "_main_":
    dot_bracket_notation = read_dot_bracket_notation("output.txt")
    plot_secondary_structure(dot_bracket_notation)
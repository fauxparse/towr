class Map < ActiveRecord::Base
  belongs_to :user, :inverse_of => :maps
  
  unless defined?(NORTH)
    NORTH = 1
    EAST  = 2
    SOUTH = 4
    WEST  = 8
    ENTRY = 16
    EXIT  = 32
  end
  
  def to_param
    id.to_map_code
  end
  
  def at(x, y)
    contents.blank? ? [] : cells[y][x]
  end
  
  def cells
    @cells ||= contents.split("|").map do |row|
      row.split(',').inject([[]] * columns) do |cells, c|
        i, s = c.split(':')
        cells[i.to_i] = s.split('+').map do |v|
          v = v.to_i(16)
          if v & ENTRY > 0
            "entry-#{v - ENTRY}"
          elsif v & EXIT > 0
            "exit-#{v - EXIT}"
          else
            "route-#{v}"
          end
        end
        cells
      end
    end
  end
  
end

module Towr
  class MapCode < String
    ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz".freeze unless defined?(ALPHABET)
    
    def self.from_i(i)
      return "0" if i.zero?
      str = ""
      while i > 0
        str = ALPHABET[i % ALPHABET.length, 1] + str
        i = i / ALPHABET.length
      end
      str
    end
    
    def self.from_s(str)
      new str
    end
  end
end

class Numeric
  def to_map_code
    Towr::MapCode.from_i(self)
  end
end

class String
  def to_map_code
    Towr::MapCode.from_s(self)
  end
end

class NilClass
  def to_map_code; nil; end
end